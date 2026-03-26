use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, OptionalAuthUser, require_role},
    AppState,
};

#[derive(Debug, Deserialize, Validate)]
pub struct CreateConsultationRequest {
    #[validate(length(min = 5))]
    pub title: String,
    #[validate(length(min = 20))]
    pub description: String,
    pub sector: Option<String>,
    pub document_url: Option<String>,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct SubmitConsultationRequest {
    pub organization: Option<String>,
    #[validate(length(min = 10))]
    pub submission: String,
    pub attachment_url: Option<String>,
}

pub async fn list_consultations(
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let consultations = sqlx::query!(
        "SELECT id, title, description, sector, start_date, end_date, status, created_at FROM consultations ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await?;

    let items: Vec<serde_json::Value> = consultations.iter().map(|c| serde_json::json!({
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "sector": c.sector,
        "start_date": c.start_date,
        "end_date": c.end_date,
        "status": c.status,
        "created_at": c.created_at,
    })).collect();

    Ok(Json(serde_json::json!({ "data": items })))
}

pub async fn get_consultation(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let consultation = sqlx::query!(
        "SELECT id, title, description, sector, document_url, start_date, end_date, status, created_at FROM consultations WHERE id = $1",
        id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "id": consultation.id,
        "title": consultation.title,
        "description": consultation.description,
        "sector": consultation.sector,
        "document_url": consultation.document_url,
        "start_date": consultation.start_date,
        "end_date": consultation.end_date,
        "status": consultation.status,
        "created_at": consultation.created_at,
    })))
}

pub async fn create_consultation(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateConsultationRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    require_role(&auth, &["ADMIN"])?;
    req.validate()
        .map_err(|e| AppError::ValidationError(vec![e.to_string()]))?;

    let start_date: chrono::NaiveDate = req.start_date.parse()
        .map_err(|_| AppError::BadRequest("Invalid start_date format".to_string()))?;
    let end_date: chrono::NaiveDate = req.end_date.parse()
        .map_err(|_| AppError::BadRequest("Invalid end_date format".to_string()))?;

    let c = sqlx::query!(
        "INSERT INTO consultations (title, description, sector, document_url, start_date, end_date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
        req.title, req.description, req.sector, req.document_url, start_date, end_date, auth.id
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "id": c.id }))))
}

pub async fn update_consultation(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN"])?;

    sqlx::query!(
        "UPDATE consultations SET status = COALESCE($1, status) WHERE id = $2",
        req.get("status").and_then(|v| v.as_str()),
        id
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Updated" })))
}

pub async fn submit_consultation(
    State(state): State<AppState>,
    OptionalAuthUser(auth): OptionalAuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<SubmitConsultationRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    req.validate()
        .map_err(|e| AppError::ValidationError(vec![e.to_string()]))?;

    let sub = sqlx::query!(
        "INSERT INTO consultation_submissions (consultation_id, submitter_id, organization, submission, attachment_url) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        id, auth.map(|u| u.id), req.organization, req.submission, req.attachment_url
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "id": sub.id, "message": "Submission received" }))))
}
