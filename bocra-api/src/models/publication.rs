use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Publication {
    pub id: Uuid,
    pub title: String,
    pub r#type: String,
    pub sector: Option<String>,
    pub file_url: Option<String>,
    pub file_size: Option<i64>,
    pub description: Option<String>,
    pub published_at: Option<DateTime<Utc>>,
    pub views: i32,
    pub downloads: i32,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}
