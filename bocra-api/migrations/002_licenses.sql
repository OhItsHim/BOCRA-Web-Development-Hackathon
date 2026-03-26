CREATE TYPE license_type AS ENUM (
  'TELECOM_CLASS', 'TELECOM_INDIVIDUAL', 'TELECOM_NETWORK',
  'BROADCAST_FTA_TV', 'BROADCAST_PAY_TV', 'BROADCAST_COMMUNITY_RADIO',
  'BROADCAST_COMMERCIAL_RADIO', 'BROADCAST_ONLINE',
  'POSTAL_COURIER', 'POSTAL_EXPRESS',
  'INTERNET_ISP', 'INTERNET_VSAT', 'SPECTRUM_FREQUENCY'
);
CREATE TYPE application_status AS ENUM (
  'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'
);
CREATE TABLE license_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES users(id),
  license_type license_type NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  address TEXT,
  documents JSONB DEFAULT '[]',
  status application_status NOT NULL DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE licensees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  license_type license_type NOT NULL,
  sector VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  license_start_date DATE,
  license_end_date DATE,
  contact_email VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  is_publicly_listed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
