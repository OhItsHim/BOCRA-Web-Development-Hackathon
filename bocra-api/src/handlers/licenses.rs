use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::Datelike;
use rand::Rng;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, require_role},
    AppState,
};

#[derive(Debug, Deserialize, Validate)]
pub struct CreateApplicationRequest {
    pub license_type: String,
    #[validate(length(min = 2))]
    pub business_name: String,
    pub registration_number: Option<String>,
    #[validate(email)]
    pub contact_email: String,
    pub contact_phone: Option<String>,
    pub address: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct TrackQuery {
    pub r#ref: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: String,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateLicenseeRequest {
    #[validate(length(min = 2))]
    pub company_name: String,
    pub license_number: String,
    pub license_type: String,
    pub sector: String,
    pub status: Option<String>,
    pub contact_email: Option<String>,
    pub website: Option<String>,
    pub description: Option<String>,
}

pub async fn get_license_types(
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "types": [
            { "id": "TELECOM_CLASS", "name": "Class Telecommunications License", "sector": "TELECOM" },
            { "id": "TELECOM_INDIVIDUAL", "name": "Individual Telecommunications License", "sector": "TELECOM" },
            { "id": "TELECOM_NETWORK", "name": "Network Service Provider License", "sector": "TELECOM" },
            { "id": "BROADCAST_FTA_TV", "name": "Free-to-Air Television License", "sector": "BROADCASTING" },
            { "id": "BROADCAST_PAY_TV", "name": "Pay Television License", "sector": "BROADCASTING" },
            { "id": "BROADCAST_COMMUNITY_RADIO", "name": "Community Radio License", "sector": "BROADCASTING" },
            { "id": "BROADCAST_COMMERCIAL_RADIO", "name": "Commercial Radio License", "sector": "BROADCASTING" },
            { "id": "BROADCAST_ONLINE", "name": "Online Broadcasting License", "sector": "BROADCASTING" },
            { "id": "POSTAL_COURIER", "name": "Courier Service License", "sector": "POSTAL" },
            { "id": "POSTAL_EXPRESS", "name": "Express Delivery License", "sector": "POSTAL" },
            { "id": "INTERNET_ISP", "name": "Internet Service Provider License", "sector": "INTERNET" },
            { "id": "INTERNET_VSAT", "name": "VSAT Service License", "sector": "INTERNET" },
            { "id": "SPECTRUM_FREQUENCY", "name": "Spectrum/Frequency Assignment", "sector": "TELECOM" }
        ]
    }))
}

pub async fn create_application(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateApplicationRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    req.validate()
        .map_err(|e| AppError::ValidationError(vec![e.to_string()]))?;

    let year = chrono::Utc::now().year();
    let num: u32 = rand::thread_rng().gen_range(10000..99999);
    let reference = format!("LIC-{}-{}", year, num);

    let app = sqlx::query!(
        r#"INSERT INTO license_applications (applicant_id, license_type, business_name, registration_number, contact_email, contact_phone, address)
           VALUES ($1, $2::license_type, $3, $4, $5, $6, $7)
           RETURNING id"#,
        auth.id,
        req.license_type as _,
        req.business_name,
        req.registration_number,
        req.contact_email,
        req.contact_phone,
        req.address
    )
    .fetch_one(&state.db)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(serde_json::json!({
            "id": app.id,
            "reference": reference,
            "message": "Application submitted successfully."
        })),
    ))
}

pub async fn list_applications(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(params): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let apps = sqlx::query!(
        r#"SELECT id, license_type::text, business_name, contact_email, status::text, submitted_at
           FROM license_applications ORDER BY submitted_at DESC LIMIT $1 OFFSET $2"#,
        per_page,
        offset
    )
    .fetch_all(&state.db)
    .await?;

    let total: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM license_applications")
        .fetch_one(&state.db)
        .await?
        .unwrap_or(0);

    let items: Vec<serde_json::Value> = apps.iter().map(|a| serde_json::json!({
        "id": a.id,
        "license_type": a.license_type,
        "business_name": a.business_name,
        "contact_email": a.contact_email,
        "status": a.status,
        "submitted_at": a.submitted_at,
    })).collect();

    Ok(Json(serde_json::json!({ "data": items, "total": total, "page": page, "per_page": per_page })))
}

pub async fn get_application(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let app = sqlx::query!(
        r#"SELECT id, license_type::text, business_name, registration_number, contact_email,
                  contact_phone, address, documents, status::text, submitted_at, reviewed_at, notes
           FROM license_applications WHERE id = $1"#,
        id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "id": app.id,
        "license_type": app.license_type,
        "business_name": app.business_name,
        "registration_number": app.registration_number,
        "contact_email": app.contact_email,
        "contact_phone": app.contact_phone,
        "address": app.address,
        "documents": app.documents,
        "status": app.status,
        "submitted_at": app.submitted_at,
        "reviewed_at": app.reviewed_at,
        "notes": app.notes,
    })))
}

pub async fn update_application_status(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateStatusRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN"])?;

    sqlx::query!(
        r#"UPDATE license_applications SET status = $1::application_status, notes = $2,
           reviewed_at = NOW(), reviewed_by = $3, updated_at = NOW() WHERE id = $4"#,
        req.status as _,
        req.notes,
        auth.id,
        id
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Status updated" })))
}

pub async fn track_application(
    State(state): State<AppState>,
    Query(params): Query<TrackQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let app = sqlx::query!(
        r#"SELECT id, license_type::text, business_name, status::text, submitted_at, reviewed_at, notes
           FROM license_applications WHERE contact_email = $1
           ORDER BY submitted_at DESC LIMIT 1"#,
        params.email
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "id": app.id,
        "license_type": app.license_type,
        "business_name": app.business_name,
        "status": app.status,
        "submitted_at": app.submitted_at,
        "reviewed_at": app.reviewed_at,
        "notes": app.notes,
    })))
}

pub async fn list_licensees(
    State(state): State<AppState>,
    Query(params): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let licensees = sqlx::query!(
        r#"SELECT id, company_name, license_number, license_type::text, sector, status,
                  license_start_date, license_end_date, contact_email, website, description
           FROM licensees WHERE is_publicly_listed = true
           ORDER BY company_name LIMIT $1 OFFSET $2"#,
        per_page,
        offset
    )
    .fetch_all(&state.db)
    .await?;

    let total: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM licensees WHERE is_publicly_listed = true")
        .fetch_one(&state.db)
        .await?
        .unwrap_or(0);

    let items: Vec<serde_json::Value> = licensees.iter().map(|l| serde_json::json!({
        "id": l.id,
        "company_name": l.company_name,
        "license_number": l.license_number,
        "license_type": l.license_type,
        "sector": l.sector,
        "status": l.status,
        "license_start_date": l.license_start_date,
        "license_end_date": l.license_end_date,
        "contact_email": l.contact_email,
        "website": l.website,
        "description": l.description,
    })).collect();

    Ok(Json(serde_json::json!({ "data": items, "total": total, "page": page, "per_page": per_page })))
}

pub async fn create_licensee(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateLicenseeRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    require_role(&auth, &["ADMIN"])?;
    req.validate()
        .map_err(|e| AppError::ValidationError(vec![e.to_string()]))?;

    let licensee = sqlx::query!(
        r#"INSERT INTO licensees (company_name, license_number, license_type, sector, status, contact_email, website, description)
           VALUES ($1, $2, $3::license_type, $4, $5, $6, $7, $8)
           RETURNING id"#,
        req.company_name,
        req.license_number,
        req.license_type as _,
        req.sector,
        req.status.as_deref().unwrap_or("ACTIVE"),
        req.contact_email,
        req.website,
        req.description
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "id": licensee.id }))))
}

pub async fn update_licensee(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN"])?;

    sqlx::query!(
        "UPDATE licensees SET status = COALESCE($1, status), updated_at = NOW() WHERE id = $2",
        req.get("status").and_then(|v| v.as_str()),
        id
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Licensee updated" })))
}
