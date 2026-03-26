use axum::{extract::{Query, State}, Json};
use serde::Deserialize;

use crate::{error::AppError, AppState};

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
    pub r#type: Option<String>,
    pub page: Option<i64>,
}

pub async fn search(
    State(state): State<AppState>,
    Query(params): Query<SearchQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let query = format!("%{}%", params.q.to_lowercase());

    let news = sqlx::query!(
        "SELECT id, title, slug as identifier, excerpt as description, 'news' as result_type, published_at as created_at FROM news_articles WHERE is_published = true AND (LOWER(title) LIKE $1 OR LOWER(content) LIKE $1) LIMIT 5",
        query
    )
    .fetch_all(&state.db)
    .await?;

    let publications = sqlx::query!(
        "SELECT id, title, id::text as identifier, description, 'publication' as result_type, published_at as created_at FROM publications WHERE published_at IS NOT NULL AND (LOWER(title) LIKE $1 OR LOWER(description) LIKE $1) LIMIT 5",
        query
    )
    .fetch_all(&state.db)
    .await?;

    let mut results: Vec<serde_json::Value> = vec![];

    for n in &news {
        results.push(serde_json::json!({
            "id": n.id,
            "title": n.title,
            "identifier": n.identifier,
            "description": n.description,
            "type": "news",
            "created_at": n.created_at,
        }));
    }

    for p in &publications {
        results.push(serde_json::json!({
            "id": p.id,
            "title": p.title,
            "identifier": p.identifier,
            "description": p.description,
            "type": "publication",
            "created_at": p.created_at,
        }));
    }

    Ok(Json(serde_json::json!({ "data": results, "query": params.q })))
}
