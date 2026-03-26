import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme/ThemeContext'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'

// Lazy load all pages
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Mandate = lazy(() => import('./pages/About/Mandate'))
const Structure = lazy(() => import('./pages/About/Structure'))
const History = lazy(() => import('./pages/About/History'))
const Leadership = lazy(() => import('./pages/About/Leadership'))
const Legislation = lazy(() => import('./pages/About/Legislation'))

const Licensing = lazy(() => import('./pages/Licensing'))
const LicenseApply = lazy(() => import('./pages/Licensing/Apply'))
const LicenseTrack = lazy(() => import('./pages/Licensing/Track'))
const Licensees = lazy(() => import('./pages/Licensing/Licensees'))

const Consumer = lazy(() => import('./pages/Consumer'))
const Rights = lazy(() => import('./pages/Consumer/Rights'))
const Complaint = lazy(() => import('./pages/Consumer/Complaint'))
const TrackComplaint = lazy(() => import('./pages/Consumer/Track'))
const Tariffs = lazy(() => import('./pages/Consumer/Tariffs'))
const Alerts = lazy(() => import('./pages/Consumer/Alerts'))

const Publications = lazy(() => import('./pages/Publications'))
const PublicationDetail = lazy(() => import('./pages/Publications/Detail'))

const Consultations = lazy(() => import('./pages/Consultations'))
const ConsultationDetail = lazy(() => import('./pages/Consultations/Detail'))

const News = lazy(() => import('./pages/News'))
const NewsDetail = lazy(() => import('./pages/News/Detail'))

const Contact = lazy(() => import('./pages/Contact'))
const Search = lazy(() => import('./pages/Search'))

const Portal = lazy(() => import('./pages/Portal/Dashboard'))
const PortalApplications = lazy(() => import('./pages/Portal/Applications'))
const PortalComplaints = lazy(() => import('./pages/Portal/Complaints'))
const PortalProfile = lazy(() => import('./pages/Portal/Profile'))

const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminApplications = lazy(() => import('./pages/Admin/Applications'))
const AdminComplaints = lazy(() => import('./pages/Admin/Complaints'))
const AdminConsultations = lazy(() => import('./pages/Admin/Consultations'))
const AdminPublications = lazy(() => import('./pages/Admin/Publications'))
const AdminNews = lazy(() => import('./pages/Admin/News'))
const AdminLicensees = lazy(() => import('./pages/Admin/Licensees'))
const AdminUsers = lazy(() => import('./pages/Admin/Users'))
const AdminFAQ = lazy(() => import('./pages/Admin/FAQ'))
const AdminAlerts = lazy(() => import('./pages/Admin/Alerts'))
const AdminAnalytics = lazy(() => import('./pages/Admin/Analytics'))

const ChatWidget = lazy(() => import('./components/chat/ChatWidget'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Navbar />
      <main id="main-content" style={{ flex: 1 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/mandate" element={<Mandate />} />
            <Route path="/about/structure" element={<Structure />} />
            <Route path="/about/history" element={<History />} />
            <Route path="/about/leadership" element={<Leadership />} />
            <Route path="/about/legislation" element={<Legislation />} />

            <Route path="/licensing" element={<Licensing />} />
            <Route path="/licensing/apply" element={<LicenseApply />} />
            <Route path="/licensing/track" element={<LicenseTrack />} />
            <Route path="/licensing/licensees" element={<Licensees />} />

            <Route path="/consumer" element={<Consumer />} />
            <Route path="/consumer/rights" element={<Rights />} />
            <Route path="/consumer/complaint" element={<Complaint />} />
            <Route path="/consumer/track" element={<TrackComplaint />} />
            <Route path="/consumer/tariffs" element={<Tariffs />} />
            <Route path="/consumer/alerts" element={<Alerts />} />

            <Route path="/publications" element={<Publications />} />
            <Route path="/publications/:id" element={<PublicationDetail />} />

            <Route path="/consultations" element={<Consultations />} />
            <Route path="/consultations/:id" element={<ConsultationDetail />} />

            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsDetail />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<Search />} />

            <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
            <Route path="/portal/applications" element={<ProtectedRoute><PortalApplications /></ProtectedRoute>} />
            <Route path="/portal/complaints" element={<ProtectedRoute><PortalComplaints /></ProtectedRoute>} />
            <Route path="/portal/profile" element={<ProtectedRoute><PortalProfile /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminApplications /></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminComplaints /></ProtectedRoute>} />
            <Route path="/admin/consultations" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminConsultations /></ProtectedRoute>} />
            <Route path="/admin/publications" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminPublications /></ProtectedRoute>} />
            <Route path="/admin/news" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminNews /></ProtectedRoute>} />
            <Route path="/admin/licensees" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminLicensees /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/faq" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminFAQ /></ProtectedRoute>} />
            <Route path="/admin/alerts" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminAlerts /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminAnalytics /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
