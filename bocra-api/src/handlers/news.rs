use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;

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
}

pub async fn list_news(
    State(state): State<AppState>,
    Query(params): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let articles = sqlx::query!(
        r#"SELECT id, title, slug, excerpt, category, sector, featured_image_url, published_at, tags
           FROM news_articles WHERE is_published = true ORDER BY published_at DESC LIMIT $1 OFFSET $2"#,
        per_page, offset
    )
    .fetch_all(&state.db)
    .await?;

    let total: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM news_articles WHERE is_published = true")
        .fetch_one(&state.db)
        .await?
        .unwrap_or(0);

    let items: Vec<serde_json::Value> = articles.iter().map(|a| serde_json::json!({
        "id": a.id,
        "title": a.title,
        "slug": a.slug,
        "excerpt": a.excerpt,
        "category": a.category,
        "sector": a.sector,
        "featured_image_url": a.featured_image_url,
        "published_at": a.published_at,
        "tags": a.tags,
    })).collect();

    Ok(Json(serde_json::json!({ "data": items, "total": total, "page": page, "per_page": per_page })))
}

pub async fn get_article(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let article = sqlx::query!(
        "SELECT id, title, slug, content, excerpt, category, sector, featured_image_url, published_at, tags FROM news_articles WHERE slug = $1 AND is_published = true",
        slug
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "content": article.content,
        "excerpt": article.excerpt,
        "category": article.category,
        "sector": article.sector,
        "featured_image_url": article.featured_image_url,
        "published_at": article.published_at,
        "tags": article.tags,
    })))
}

pub async fn create_article(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<serde_json::Value>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    require_role(&auth, &["ADMIN"])?;

    let title = req["title"].as_str().unwrap_or("").to_string();
    let slug = title.to_lowercase().replace(' ', "-").replace(|c: char| !c.is_alphanumeric() && c != '-', "");

    let article = sqlx::query!(
        r#"INSERT INTO news_articles (title, slug, content, excerpt, category, sector, is_published, published_at, author_id)
           VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), $7) RETURNING id, slug"#,
        title,
        slug,
        req["content"].as_str().unwrap_or(""),
        req.get("excerpt").and_then(|v| v.as_str()),
        req.get("category").and_then(|v| v.as_str()),
        req.get("sector").and_then(|v| v.as_str()),
        auth.id
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "id": article.id, "slug": article.slug }))))
}

pub async fn update_article(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(slug): Path<String>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN"])?;

    sqlx::query!(
        "UPDATE news_articles SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE slug = $3",
        req.get("title").and_then(|v| v.as_str()),
        req.get("content").and_then(|v| v.as_str()),
        slug
    )
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "message": "Updated" })))
}

pub async fn delete_article(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(slug): Path<String>,
) -> Result<StatusCode, AppError> {
    require_role(&auth, &["ADMIN"])?;
    sqlx::query!("DELETE FROM news_articles WHERE slug = $1", slug)
        .execute(&state.db)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
