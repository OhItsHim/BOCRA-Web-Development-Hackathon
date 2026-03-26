export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'PUBLIC' | 'LICENSEE'
  first_name: string
  last_name: string
  phone?: string
  organization?: string
  is_verified: boolean
  created_at: string
}

export interface Complaint {
  id: string
  ticket_number: string
  category: string
  sector: string
  status: string
  priority: string
  description: string
  resolution?: string
  submitted_at: string
  resolved_at?: string
  updated_at: string
}

export interface LicenseApplication {
  id: string
  license_type: string
  business_name: string
  contact_email: string
  status: string
  submitted_at: string
  reviewed_at?: string
  notes?: string
}

export interface Licensee {
  id: string
  company_name: string
  license_number: string
  license_type: string
  sector: string
  status: string
  license_start_date?: string
  license_end_date?: string
  contact_email?: string
  website?: string
  description?: string
}

export interface Consultation {
  id: string
  title: string
  description: string
  sector?: string
  document_url?: string
  start_date: string
  end_date: string
  status: string
  created_at: string
}

export interface Publication {
  id: string
  title: string
  type: string
  sector?: string
  file_url?: string
  file_size?: number
  description?: string
  published_at?: string
  views: number
  downloads: number
}

export interface NewsArticle {
  id: string
  title: string
  slug: string
  content?: string
  excerpt?: string
  category?: string
  sector?: string
  featured_image_url?: string
  published_at?: string
  tags: string[]
}

export interface Alert {
  id: string
  title: string
  message: string
  type: string
  sector?: string
  expires_at?: string
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}
