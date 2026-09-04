import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MentorshipPage from './pages/MentorshipPage.jsx'
import OpportunitiesPage from './pages/OpportunitiesPage.jsx'
import OpportunityApplicationPage from './pages/OpportunityApplicationPage.jsx'
import PathwaysPage from './pages/PathwaysPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import SupportWidget from './components/SupportWidget.jsx'
import AnnouncementTicker from './components/AnnouncementTicker.jsx'
import AwarenessAd from './components/AwarenessAd.jsx'
import ImpactSection from './components/ImpactSection.jsx'
import AdminNavigation from './components/AdminNavigation.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import AdminSupportPage from './pages/AdminSupportPage.jsx'
import AdminAdsPage from './pages/AdminAdsPage.jsx'

function RootRedirect() {
  return <Navigate to="/opportunities" replace />
}

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function PublicLayout({ children }) {
  return <AppLayout>{children}</AppLayout>
}

function App() {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()
  const hideNavbarOn = ['/login', '/register']
  const showNavbar = isAuthenticated && !hideNavbarOn.some((path) => location.pathname.startsWith(path))

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-700">Loading authentication state...</p>
      </main>
    )
  }

  return (
    <>
      <AnnouncementTicker />
      <AwarenessAd />
      {showNavbar && <Navbar />}
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/opportunities" element={<PublicLayout><OpportunitiesPage /></PublicLayout>} />
            <Route
              path="/opportunities/:id/apply"
              element={
                <ProtectedRoute allowedRoles={['student', 'mentor']}>
                  <AppLayout>
                    <OpportunityApplicationPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/pathways" element={<ProtectedLayout><PathwaysPage /></ProtectedLayout>} />
            <Route path="/mentorship" element={<ProtectedLayout><MentorshipPage /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[ 'admin', 'super_admin' ]}>
                  <AppLayout>
                    <div className="space-y-6">
                      <AdminNavigation />
                      <AdminPage />
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AppLayout><AdminUsersPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/support"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AppLayout><AdminSupportPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ads"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AppLayout><AdminAdsPage /></AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <ImpactSection />
        <Footer />
      </div>
      <SupportWidget />
    </>
  )
}

export default App
