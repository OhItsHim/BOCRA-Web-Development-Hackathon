use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Complaint {
    pub id: Uuid,
    pub submitter_id: Option<Uuid>,
    pub ticket_number: String,
    pub category: String,
    pub sector: String,
    pub licensee_id: Option<Uuid>,
    pub description: String,
    pub attachments: serde_json::Value,
    pub status: String,
    pub priority: String,
    pub assigned_to: Option<Uuid>,
    pub resolution: Option<String>,
    pub submitted_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}
