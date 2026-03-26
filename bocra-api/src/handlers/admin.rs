use axum::{extract::State, Json};

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, require_role},
    AppState,
};

pub async fn stats_overview(
    State(state): State<AppState>,
    auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;

    let total_applications: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM license_applications")
        .fetch_one(&state.db).await?.unwrap_or(0);

    let open_complaints: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM complaints WHERE status = 'OPEN'")
        .fetch_one(&state.db).await?.unwrap_or(0);

    let active_licensees: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM licensees WHERE status = 'ACTIVE'")
        .fetch_one(&state.db).await?.unwrap_or(0);

    let total_users: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db).await?.unwrap_or(0);

    Ok(Json(serde_json::json!({
        "total_applications": total_applications,
        "open_complaints": open_complaints,
        "active_licensees": active_licensees,
        "total_users": total_users,
    })))
}

pub async fn stats_complaints(
    State(state): State<AppState>,
    auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;

    let by_status = sqlx::query!(
        r#"SELECT status::text, COUNT(*) as count FROM complaints GROUP BY status"#
    )
    .fetch_all(&state.db)
    .await?;

    let by_sector = sqlx::query!(
        r#"SELECT sector::text, COUNT(*) as count FROM complaints GROUP BY sector"#
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(serde_json::json!({
        "by_status": by_status.iter().map(|r| serde_json::json!({ "status": r.status, "count": r.count })).collect::<Vec<_>>(),
        "by_sector": by_sector.iter().map(|r| serde_json::json!({ "sector": r.sector, "count": r.count })).collect::<Vec<_>>(),
    })))
}

pub async fn stats_applications(
    State(state): State<AppState>,
    auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;

    let by_status = sqlx::query!(
        r#"SELECT status::text, COUNT(*) as count FROM license_applications GROUP BY status"#
    )
    .fetch_all(&state.db)
    .await?;

    let by_type = sqlx::query!(
        r#"SELECT license_type::text, COUNT(*) as count FROM license_applications GROUP BY license_type"#
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(serde_json::json!({
        "by_status": by_status.iter().map(|r| serde_json::json!({ "status": r.status, "count": r.count })).collect::<Vec<_>>(),
        "by_type": by_type.iter().map(|r| serde_json::json!({ "type": r.license_type, "count": r.count })).collect::<Vec<_>>(),
    })))
}

pub async fn stats_pageviews(
    State(state): State<AppState>,
    auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    require_role(&auth, &["ADMIN", "STAFF"])?;

    let total_events: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM analytics_events")
        .fetch_one(&state.db).await?.unwrap_or(0);

    let by_page = sqlx::query!(
        "SELECT page, COUNT(*) as count FROM analytics_events WHERE page IS NOT NULL GROUP BY page ORDER BY count DESC LIMIT 10"
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(serde_json::json!({
        "total_events": total_events,
        "top_pages": by_page.iter().map(|r| serde_json::json!({ "page": r.page, "count": r.count })).collect::<Vec<_>>(),
    })))
}
