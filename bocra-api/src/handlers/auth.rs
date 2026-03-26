use axum::{extract::State, http::StatusCode, Json};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use chrono::Utc;
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use time::Duration;
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, Claims},
    AppState,
};

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(length(min = 1))]
    pub first_name: String,
    #[validate(length(min = 1))]
    pub last_name: String,
    pub phone: Option<String>,
    pub organization: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub token_type: String,
    pub user: UserInfo,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: Uuid,
    pub email: String,
    pub role: String,
    pub first_name: String,
    pub last_name: String,
}

fn generate_access_token(
    user_id: &Uuid,
    email: &str,
    role: &str,
    secret: &str,
    expiry_minutes: i64,
) -> Result<String, AppError> {
    let now = Utc::now().timestamp() as usize;
    let exp = (Utc::now() + chrono::Duration::minutes(expiry_minutes)).timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        exp,
        iat: now,
    };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::InternalServerError)
}

fn generate_refresh_token(
    user_id: &Uuid,
    email: &str,
    role: &str,
    secret: &str,
    expiry_days: i64,
) -> Result<String, AppError> {
    let now = Utc::now().timestamp() as usize;
    let exp = (Utc::now() + chrono::Duration::days(expiry_days)).timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        exp,
        iat: now,
    };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::InternalServerError)
}

pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    req.validate()
        .map_err(|e| AppError::ValidationError(vec![e.to_string()]))?;

    // Check if email exists
    let existing = sqlx::query!("SELECT id FROM users WHERE email = $1", req.email)
        .fetch_optional(&state.db)
        .await?;

    if existing.is_some() {
        return Err(AppError::Conflict);
    }

    // Hash password
    let salt = argon2::password_hash::SaltString::generate(&mut rand::rngs::OsRng);
    let argon2 = argon2::Argon2::new(
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        argon2::Params::new(65536, 3, 4, None).unwrap(),
    );
    let password_hash = argon2::PasswordHasher::hash_password(&argon2, req.password.as_bytes(), &salt)
        .map_err(|_| AppError::InternalServerError)?
        .to_string();

    let user = sqlx::query!(
        r#"INSERT INTO users (email, password_hash, first_name, last_name, phone, organization)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, role::text as role, first_name, last_name"#,
        req.email,
        password_hash,
        req.first_name,
        req.last_name,
        req.phone,
        req.organization
    )
    .fetch_one(&state.db)
    .await?;

    let access_token = generate_access_token(
        &user.id,
        &user.email,
        user.role.as_deref().unwrap_or("PUBLIC"),
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            access_token,
            token_type: "Bearer".to_string(),
            user: UserInfo {
                id: user.id,
                email: user.email,
                role: user.role.unwrap_or_else(|| "PUBLIC".to_string()),
                first_name: user.first_name,
                last_name: user.last_name,
            },
        }),
    ))
}

pub async fn login(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(req): Json<LoginRequest>,
) -> Result<(CookieJar, Json<AuthResponse>), AppError> {
    req.validate()
        .map_err(|e| AppError::ValidationError(vec![e.to_string()]))?;

    let user = sqlx::query!(
        r#"SELECT id, email, password_hash, role::text as role, first_name, last_name
           FROM users WHERE email = $1"#,
        req.email
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Unauthorized)?;

    let parsed_hash = argon2::PasswordHash::new(&user.password_hash)
        .map_err(|_| AppError::InternalServerError)?;
    let argon2 = argon2::Argon2::default();
    argon2::PasswordVerifier::verify_password(&argon2, req.password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::Unauthorized)?;

    let role = user.role.as_deref().unwrap_or("PUBLIC");
    let access_token = generate_access_token(
        &user.id,
        &user.email,
        role,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;
    let refresh_token = generate_refresh_token(
        &user.id,
        &user.email,
        role,
        &state.config.jwt_secret,
        state.config.jwt_refresh_expiry_days,
    )?;

    let cookie = Cookie::build(("refresh_token", refresh_token))
        .http_only(true)
        .same_site(SameSite::Strict)
        .max_age(Duration::days(state.config.jwt_refresh_expiry_days))
        .path("/")
        .build();

    Ok((
        jar.add(cookie),
        Json(AuthResponse {
            access_token,
            token_type: "Bearer".to_string(),
            user: UserInfo {
                id: user.id,
                email: user.email,
                role: role.to_string(),
                first_name: user.first_name,
                last_name: user.last_name,
            },
        }),
    ))
}

pub async fn logout(jar: CookieJar) -> (CookieJar, StatusCode) {
    let cookie = Cookie::build(("refresh_token", ""))
        .http_only(true)
        .max_age(Duration::seconds(0))
        .path("/")
        .build();
    (jar.add(cookie), StatusCode::NO_CONTENT)
}

pub async fn refresh(
    State(state): State<AppState>,
    jar: CookieJar,
) -> Result<Json<serde_json::Value>, AppError> {
    let refresh_token = jar
        .get("refresh_token")
        .ok_or(AppError::Unauthorized)?
        .value()
        .to_string();

    let token_data = jsonwebtoken::decode::<Claims>(
        &refresh_token,
        &jsonwebtoken::DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &jsonwebtoken::Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized)?;

    let access_token = generate_access_token(
        &Uuid::parse_str(&token_data.claims.sub).map_err(|_| AppError::Unauthorized)?,
        &token_data.claims.email,
        &token_data.claims.role,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;

    Ok(Json(serde_json::json!({ "access_token": access_token, "token_type": "Bearer" })))
}

pub async fn me(
    State(state): State<AppState>,
    auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    let user = sqlx::query!(
        r#"SELECT id, email, role::text as role, first_name, last_name, phone, organization, is_verified, created_at
           FROM users WHERE id = $1"#,
        auth.id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "organization": user.organization,
        "is_verified": user.is_verified,
        "created_at": user.created_at
    })))
}
