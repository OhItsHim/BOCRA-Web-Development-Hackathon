CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  sector VARCHAR(100),
  document_url VARCHAR(500),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE consultation_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  submitter_id UUID REFERENCES users(id),
  organization VARCHAR(255),
  submission TEXT NOT NULL,
  attachment_url VARCHAR(500),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
