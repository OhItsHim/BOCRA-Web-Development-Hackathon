use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LicenseApplication {
    pub id: Uuid,
    pub applicant_id: Option<Uuid>,
    pub license_type: String,
    pub business_name: String,
    pub registration_number: Option<String>,
    pub contact_email: String,
    pub contact_phone: Option<String>,
    pub address: Option<String>,
    pub documents: serde_json::Value,
    pub status: String,
    pub submitted_at: DateTime<Utc>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub reviewed_by: Option<Uuid>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Licensee {
    pub id: Uuid,
    pub company_name: String,
    pub license_number: String,
    pub license_type: String,
    pub sector: String,
    pub status: String,
    pub license_start_date: Option<NaiveDate>,
    pub license_end_date: Option<NaiveDate>,
    pub contact_email: Option<String>,
    pub website: Option<String>,
    pub description: Option<String>,
    pub is_publicly_listed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
