use axum::{
    http::{header, HeaderValue, Method},
    middleware,
    routing::{delete, get, patch, post},
    Router,
};
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    trace::TraceLayer,
};

use crate::{handlers, middleware::security::security_headers, AppState};

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(
            state
                .config
                .frontend_origin
                .parse::<HeaderValue>()
                .unwrap_or(HeaderValue::from_static("http://localhost:5173")),
        )
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            header::ACCEPT,
            header::ORIGIN,
        ])
        .allow_credentials(true);

    let api = Router::new()
        // Auth
        .route("/auth/register", post(handlers::auth::register))
        .route("/auth/login", post(handlers::auth::login))
        .route("/auth/logout", post(handlers::auth::logout))
        .route("/auth/refresh", post(handlers::auth::refresh))
        .route("/auth/me", get(handlers::auth::me))
        // Complaints
        .route("/complaints", post(handlers::complaints::create_complaint))
        .route("/complaints", get(handlers::complaints::list_complaints))
        .route("/complaints/track", get(handlers::complaints::track_complaint))
        .route("/complaints/:id", get(handlers::complaints::get_complaint))
        .route("/complaints/:id/status", patch(handlers::complaints::update_complaint_status))
        .route("/complaints/:id/assign", patch(handlers::complaints::assign_complaint))
        // Licenses
        .route("/licenses/types", get(handlers::licenses::get_license_types))
        .route("/licenses/applications", post(handlers::licenses::create_application))
        .route("/licenses/applications", get(handlers::licenses::list_applications))
        .route("/licenses/applications/:id", get(handlers::licenses::get_application))
        .route(
            "/licenses/applications/:id/status",
            patch(handlers::licenses::update_application_status),
        )
        .route("/licenses/track", get(handlers::licenses::track_application))
        .route("/licenses/licensees", get(handlers::licenses::list_licensees))
        .route("/licenses/licensees", post(handlers::licenses::create_licensee))
        .route("/licenses/licensees/:id", patch(handlers::licenses::update_licensee))
        // Consultations
        .route("/consultations", get(handlers::consultations::list_consultations))
        .route("/consultations", post(handlers::consultations::create_consultation))
        .route("/consultations/:id", get(handlers::consultations::get_consultation))
        .route("/consultations/:id", patch(handlers::consultations::update_consultation))
        .route(
            "/consultations/:id/submit",
            post(handlers::consultations::submit_consultation),
        )
        // Publications
        .route("/publications", get(handlers::publications::list_publications))
        .route("/publications", post(handlers::publications::create_publication))
        .route("/publications/:id", get(handlers::publications::get_publication))
        .route("/publications/:id", patch(handlers::publications::update_publication))
        .route("/publications/:id", delete(handlers::publications::delete_publication))
        // News
        .route("/news", get(handlers::news::list_news))
        .route("/news", post(handlers::news::create_article))
        .route("/news/:slug", get(handlers::news::get_article))
        .route("/news/:slug", patch(handlers::news::update_article))
        .route("/news/:slug", delete(handlers::news::delete_article))
        // Alerts
        .route("/alerts/active", get(handlers::alerts::get_active_alerts))
        .route("/alerts", post(handlers::alerts::create_alert))
        .route("/alerts/:id", patch(handlers::alerts::update_alert))
        .route("/alerts/:id", delete(handlers::alerts::delete_alert))
        // Search
        .route("/search", get(handlers::search::search))
        // Admin stats
        .route("/admin/stats/overview", get(handlers::admin::stats_overview))
        .route("/admin/stats/complaints", get(handlers::admin::stats_complaints))
        .route("/admin/stats/applications", get(handlers::admin::stats_applications))
        .route("/admin/stats/pageviews", get(handlers::admin::stats_pageviews))
        // Analytics
        .route("/analytics/event", post(handlers::analytics::track_event))
        .with_state(state.clone());

    Router::new()
        .nest("/api/v1", api)
        .layer(middleware::from_fn(security_headers))
        .layer(cors)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
}
