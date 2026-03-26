import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../api/endpoints/admin'
import { AdminSidebar } from './Dashboard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#1565C0', '#F9A825', '#2E7D32', '#B71C1C']

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const { data: overview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.statsOverview().then(r => r.data),
  })
  const { data: complaints } = useQuery({
    queryKey: ['admin-stats-complaints'],
    queryFn: () => adminApi.statsComplaints().then(r => r.data),
  })
  const { data: pageviews } = useQuery({
    queryKey: ['admin-stats-pageviews'],
    queryFn: () => adminApi.statsPageviews().then(r => r.data),
  })

  // Build chart data from stats or use fallback demo data
  const sectorData = [
    { name: 'Telecom', value: overview?.complaints_by_sector?.TELECOM || 42 },
    { name: 'Broadcasting', value: overview?.complaints_by_sector?.BROADCASTING || 18 },
    { name: 'Internet', value: overview?.complaints_by_sector?.INTERNET || 31 },
    { name: 'Postal', value: overview?.complaints_by_sector?.POSTAL || 9 },
  ]

  const appTrendData = (overview?.applications_trend_monthly || [
    { month: 'Oct', count: 8 }, { month: 'Nov', count: 12 }, { month: 'Dec', count: 6 },
    { month: 'Jan', count: 15 }, { month: 'Feb', count: 11 }, { month: 'Mar', count: 18 },
  ])

  const pvData = (pageviews?.daily || [
    { date: 'Mon', views: 280 }, { date: 'Tue', views: 410 }, { date: 'Wed', views: 390 },
    { date: 'Thu', views: 520 }, { date: 'Fri', views: 480 }, { date: 'Sat', views: 220 }, { date: 'Sun', views: 190 },
  ])

  const summaryStats = [
    { label: 'Total Applications', value: overview?.total_applications ?? 0, color: '#1565C0' },
    { label: 'Total Complaints', value: overview?.total_complaints ?? 0, color: '#F9A825' },
    { label: 'Active Licensees', value: overview?.active_licensees ?? 0, color: '#2E7D32' },
    { label: 'Registered Users', value: overview?.total_users ?? 0, color: '#4FC3F7' },
  ]

  const chartTooltipStyle = {
    backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.8rem',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analytics
          </h1>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '0.35rem 0.875rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                border: '1px solid',
                borderColor: period === p ? 'var(--color-accent)' : 'var(--border-default)',
                backgroundColor: period === p ? 'rgba(79,195,247,0.12)' : 'var(--bg-surface)',
                color: period === p ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}>
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary metric row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {summaryStats.map(({ label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderTop: `3px solid ${color}` }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Application trend */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Applications Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints by sector pie */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Complaints by Sector</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sectorData} cx="50%" cy="45%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Page views chart */}
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Page Views (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="views" stroke="#4FC3F7" strokeWidth={2.5} dot={{ fill: '#4FC3F7', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}
