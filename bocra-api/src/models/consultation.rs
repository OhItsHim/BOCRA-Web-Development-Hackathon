use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Consultation {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub sector: Option<String>,
    pub document_url: Option<String>,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub status: String,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ConsultationSubmission {
    pub id: Uuid,
    pub consultation_id: Uuid,
    pub submitter_id: Option<Uuid>,
    pub organization: Option<String>,
    pub submission: String,
    pub attachment_url: Option<String>,
    pub submitted_at: DateTime<Utc>,
}
