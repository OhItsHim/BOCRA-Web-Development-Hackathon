use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, require_role},
    AppState,
};

pub async fn get_active_alerts(
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let alerts = sqlx::query!(
        r#"SELECT id, title, message, type, sector, expires_at, created_at
           FROM alerts WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())
           ORDER BY created_at DESC"#
    )
    .fetch_all(&state.db)
    .await?;

    let items: Vec<serde_json::Value> = alerts.iter().map(|a| serde_json::json!({
        "id": a.id,
        "title": a.title,
        "message": a.message,
        "type": a.r#type,
        "sector": a.sector,
        "expires_at": a.expires_at,
        "created_at": a.created_at,
    })).collect();

    Ok(Json(serde_json::json!({ "data": items })))
}

pub async fn create_alert(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<serde_json::Value>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    require_role(&auth, &["ADMIN"])?;

    let alert = sqlx::query!(
        r#"INSERT INTO alerts (title, message, type, sector, created_by)
           VALUES ($1, $2, $3, $4, $5) RETURNING id"#,
        req["title"].as_str().unwrap_or(""),
        req["message"].as_str().unwrap_or(""),
        req.get("type").and_then(|v| v.as_str()).unwrap_or("INFO"),
        req.get("sector").and_then(|v| v.as_str()),
        auth.id
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "id": alert.id }))))
}

pub async fn update_alert(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN"])?;

    let is_active = req.get("is_active").and_then(|v| v.as_bool());
    sqlx::query!(
        "UPDATE alerts SET is_active = COALESCE($1, is_active) WHERE id = $2",
        is_active,
        id
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Updated" })))
}

pub async fn delete_alert(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    require_role(&auth, &["ADMIN"])?;
    sqlx::query!("DELETE FROM alerts WHERE id = $1", id)
        .execute(&state.db)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
