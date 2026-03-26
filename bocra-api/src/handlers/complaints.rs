use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use rand::Rng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, OptionalAuthUser, require_role},
    AppState,
};

#[derive(Debug, Deserialize, Validate)]
pub struct CreateComplaintRequest {
    pub category: String,
    pub sector: String,
    pub licensee_id: Option<Uuid>,
    #[validate(length(min = 50))]
    pub description: String,
    pub priority: Option<String>,
    pub contact_email: Option<String>,
    pub ip_address: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct TrackQuery {
    pub ticket: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
    pub sector: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: String,
    pub resolution: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AssignRequest {
    pub assigned_to: Uuid,
}

fn generate_ticket_number() -> String {
    let year = Utc::now().year();
    let num: u32 = rand::thread_rng().gen_range(100000..999999);
    format!("BOCRA-{}-{}", year, num)
}

pub async fn create_complaint(
    State(state): State<AppState>,
    OptionalAuthUser(auth): OptionalAuthUser,
    Json(req): Json<CreateComplaintRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    req.validate()
        .map_err(|e| AppError::ValidationError(vec![e.to_string()]))?;

    let ticket = generate_ticket_number();
    let submitter_id = auth.map(|u| u.id);

    let complaint = sqlx::query!(
        r#"INSERT INTO complaints (submitter_id, ticket_number, category, sector, licensee_id, description, priority)
           VALUES ($1, $2, $3::complaint_category, $4::complaint_sector, $5, $6, $7::complaint_priority)
           RETURNING id, ticket_number"#,
        submitter_id,
        ticket,
        req.category as _,
        req.sector as _,
        req.licensee_id,
        req.description,
        req.priority.as_deref().unwrap_or("MEDIUM") as _
    )
    .fetch_one(&state.db)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(serde_json::json!({
            "id": complaint.id,
            "ticket_number": complaint.ticket_number,
            "message": "Complaint submitted successfully. Use your ticket number to track status."
        })),
    ))
}

pub async fn list_complaints(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(params): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let complaints = sqlx::query!(
        r#"SELECT id, ticket_number, category::text, sector::text, status::text, priority::text,
                  description, submitted_at, updated_at, submitter_id
           FROM complaints
           ORDER BY submitted_at DESC
           LIMIT $1 OFFSET $2"#,
        per_page,
        offset
    )
    .fetch_all(&state.db)
    .await?;

    let total: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM complaints")
        .fetch_one(&state.db)
        .await?
        .unwrap_or(0);

    let items: Vec<serde_json::Value> = complaints
        .iter()
        .map(|c| {
            serde_json::json!({
                "id": c.id,
                "ticket_number": c.ticket_number,
                "category": c.category,
                "sector": c.sector,
                "status": c.status,
                "priority": c.priority,
                "description": c.description,
                "submitted_at": c.submitted_at,
                "updated_at": c.updated_at,
            })
        })
        .collect();

    Ok(Json(serde_json::json!({
        "data": items,
        "total": total,
        "page": page,
        "per_page": per_page
    })))
}

pub async fn get_complaint(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let complaint = sqlx::query!(
        r#"SELECT id, ticket_number, category::text, sector::text, status::text, priority::text,
                  description, resolution, submitted_at, resolved_at, updated_at
           FROM complaints WHERE id = $1"#,
        id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "id": complaint.id,
        "ticket_number": complaint.ticket_number,
        "category": complaint.category,
        "sector": complaint.sector,
        "status": complaint.status,
        "priority": complaint.priority,
        "description": complaint.description,
        "resolution": complaint.resolution,
        "submitted_at": complaint.submitted_at,
        "resolved_at": complaint.resolved_at,
        "updated_at": complaint.updated_at,
    })))
}

pub async fn track_complaint(
    State(state): State<AppState>,
    Query(params): Query<TrackQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let complaint = sqlx::query!(
        r#"SELECT c.id, c.ticket_number, c.category::text, c.sector::text, c.status::text,
                  c.priority::text, c.description, c.resolution, c.submitted_at, c.resolved_at
           FROM complaints c
           WHERE c.ticket_number = $1"#,
        params.ticket
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "ticket_number": complaint.ticket_number,
        "status": complaint.status,
        "priority": complaint.priority,
        "category": complaint.category,
        "sector": complaint.sector,
        "description": complaint.description,
        "resolution": complaint.resolution,
        "submitted_at": complaint.submitted_at,
        "resolved_at": complaint.resolved_at,
    })))
}

pub async fn update_complaint_status(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateStatusRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;

    let resolved_at = if req.status == "RESOLVED" || req.status == "CLOSED" {
        Some(Utc::now())
    } else {
        None
    };

    sqlx::query!(
        r#"UPDATE complaints SET status = $1::complaint_status, resolution = $2,
           resolved_at = $3, updated_at = NOW() WHERE id = $4"#,
        req.status as _,
        req.resolution,
        resolved_at,
        id
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Status updated" })))
}

pub async fn assign_complaint(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<AssignRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;

    sqlx::query!(
        "UPDATE complaints SET assigned_to = $1, updated_at = NOW() WHERE id = $2",
        req.assigned_to,
        id
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Complaint assigned" })))
}

// Add the missing Year trait usage
use chrono::Datelike;
