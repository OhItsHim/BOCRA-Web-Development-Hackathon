use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, require_role},
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub sector: Option<String>,
    pub r#type: Option<String>,
}

pub async fn list_publications(
    State(state): State<AppState>,
    Query(params): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let pubs = sqlx::query!(
        r#"SELECT id, title, type, sector, file_url, file_size, description, published_at, views, downloads
           FROM publications WHERE published_at IS NOT NULL ORDER BY published_at DESC LIMIT $1 OFFSET $2"#,
        per_page, offset
    )
    .fetch_all(&state.db)
    .await?;

    let total: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM publications WHERE published_at IS NOT NULL")
        .fetch_one(&state.db)
        .await?
        .unwrap_or(0);

    let items: Vec<serde_json::Value> = pubs.iter().map(|p| serde_json::json!({
        "id": p.id,
        "title": p.title,
        "type": p.r#type,
        "sector": p.sector,
        "file_url": p.file_url,
        "file_size": p.file_size,
        "description": p.description,
        "published_at": p.published_at,
        "views": p.views,
        "downloads": p.downloads,
    })).collect();

    Ok(Json(serde_json::json!({ "data": items, "total": total, "page": page, "per_page": per_page })))
}

pub async fn get_publication(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    sqlx::query!("UPDATE publications SET views = views + 1 WHERE id = $1", id)
        .execute(&state.db)
        .await.ok();

    let pub_ = sqlx::query!(
        "SELECT id, title, type, sector, file_url, file_size, description, published_at, views, downloads FROM publications WHERE id = $1",
        id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "id": pub_.id,
        "title": pub_.title,
        "type": pub_.r#type,
        "sector": pub_.sector,
        "file_url": pub_.file_url,
        "file_size": pub_.file_size,
        "description": pub_.description,
        "published_at": pub_.published_at,
        "views": pub_.views,
        "downloads": pub_.downloads,
    })))
}

pub async fn create_publication(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<serde_json::Value>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    require_role(&auth, &["ADMIN"])?;

    let pub_ = sqlx::query!(
        r#"INSERT INTO publications (title, type, sector, file_url, description, published_at, created_by)
           VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING id"#,
        req["title"].as_str().unwrap_or(""),
        req["type"].as_str().unwrap_or("DOCUMENT"),
        req.get("sector").and_then(|v| v.as_str()),
        req.get("file_url").and_then(|v| v.as_str()),
        req.get("description").and_then(|v| v.as_str()),
        auth.id
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "id": pub_.id }))))
}

pub async fn update_publication(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN"])?;

    sqlx::query!(
        "UPDATE publications SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3",
        req.get("title").and_then(|v| v.as_str()),
        req.get("description").and_then(|v| v.as_str()),
        id
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Updated" })))
}

pub async fn delete_publication(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    require_role(&auth, &["ADMIN"])?;
    sqlx::query!("DELETE FROM publications WHERE id = $1", id)
        .execute(&state.db)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
