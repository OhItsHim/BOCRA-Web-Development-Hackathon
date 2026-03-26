import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  keyField?: string
}

export default function DataTable<T extends Record<string, unknown>>({ columns, data, loading, keyField = 'id' }: DataTableProps<T>) {
  if (loading) return <LoadingSpinner />

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 12px', textAlign: 'left', fontWeight: 600,
                color: 'var(--text-secondary)', fontSize: '0.75rem',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No records found
              </td>
            </tr>
          ) : data.map((row, i) => (
            <tr
              key={String(row[keyField] ?? i)}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-elevated)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px', color: 'var(--text-primary)' }}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
