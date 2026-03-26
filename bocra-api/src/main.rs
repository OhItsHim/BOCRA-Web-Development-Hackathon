mod config;
mod db;
mod error;
mod handlers;
mod middleware;
mod models;
mod redis;
mod router;

use std::sync::Arc;
use sqlx::PgPool;
use deadpool_redis::Pool as RedisPool;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: RedisPool,
    pub config: Arc<AppConfig>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "bocra_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = AppConfig::from_env()?;
    tracing::info!("Connecting to database...");
    let db = db::create_pool(&config.database_url).await?;
    sqlx::migrate!("./migrations").run(&db).await?;

    tracing::info!("Connecting to Redis...");
    let redis = redis::create_pool(&config.redis_url)?;

    // Create upload directory
    tokio::fs::create_dir_all(&config.upload_dir).await.ok();

    let port = config.port;
    let state = AppState {
        db,
        redis,
        config: Arc::new(config),
    };

    let app = router::create_router(state);
    let addr = format!("0.0.0.0:{}", port);
    tracing::info!("BOCRA API listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
