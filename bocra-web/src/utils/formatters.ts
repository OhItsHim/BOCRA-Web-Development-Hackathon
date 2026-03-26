export function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-BW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-BW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-BW').format(num)
}

export function sectorColor(sector: string | null | undefined): string {
  switch (sector?.toUpperCase()) {
    case 'TELECOM': return 'var(--color-telecoms)'
    case 'BROADCASTING': return 'var(--color-broadcast)'
    case 'INTERNET': return 'var(--color-internet)'
    case 'POSTAL': return 'var(--color-postal)'
    default: return 'var(--color-accent)'
  }
}

export function sectorBg(sector: string | null | undefined): string {
  switch (sector?.toUpperCase()) {
    case 'TELECOM': return 'var(--color-telecoms-bg)'
    case 'BROADCASTING': return 'var(--color-broadcast-bg)'
    case 'INTERNET': return 'var(--color-internet-bg)'
    case 'POSTAL': return 'var(--color-postal-bg)'
    default: return 'rgba(79,195,247,0.15)'
  }
}

export function statusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'OPEN': case 'PENDING': return '#F9A825'
    case 'IN_PROGRESS': case 'UNDER_REVIEW': return '#1565C0'
    case 'RESOLVED': case 'APPROVED': case 'ACTIVE': return '#2E7D32'
    case 'CLOSED': case 'REJECTED': case 'SUSPENDED': return '#B71C1C'
    default: return 'var(--text-secondary)'
  }
}
