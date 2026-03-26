CREATE TYPE complaint_category AS ENUM (
  'BILLING', 'COVERAGE', 'SERVICE_QUALITY', 'CONTENT', 'SPAM', 'OTHER'
);
CREATE TYPE complaint_sector AS ENUM (
  'TELECOM', 'BROADCASTING', 'POSTAL', 'INTERNET'
);
CREATE TYPE complaint_status AS ENUM (
  'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'
);
CREATE TYPE complaint_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_id UUID REFERENCES users(id),
  ticket_number VARCHAR(30) UNIQUE NOT NULL,
  category complaint_category NOT NULL,
  sector complaint_sector NOT NULL,
  licensee_id UUID REFERENCES licensees(id),
  description TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  status complaint_status NOT NULL DEFAULT 'OPEN',
  priority complaint_priority NOT NULL DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES users(id),
  resolution TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
