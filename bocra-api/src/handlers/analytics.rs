use axum::{extract::State, http::StatusCode, Json};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::{error::AppError, middleware::auth::OptionalAuthUser, AppState};

pub async fn track_event(
    State(state): State<AppState>,
    OptionalAuthUser(auth): OptionalAuthUser,
    Json(req): Json<serde_json::Value>,
) -> Result<StatusCode, AppError> {
    let event_type = req["event_type"].as_str().unwrap_or("pageview").to_string();
    let page = req.get("page").and_then(|v| v.as_str()).map(String::from);
    let session_id = req.get("session_id").and_then(|v| v.as_str()).map(String::from);
    let metadata = req.get("metadata").cloned().unwrap_or(serde_json::json!({}));
    let user_id = auth.map(|u| u.id);

    sqlx::query!(
        "INSERT INTO analytics_events (event_type, page, user_id, session_id, metadata) VALUES ($1, $2, $3, $4, $5)",
        event_type,
        page,
        user_id,
        session_id,
        metadata
    )
    .execute(&state.db)
    .await?;

    Ok(StatusCode::NO_CONTENT)
}
