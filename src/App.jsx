import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MentorshipPage from './pages/MentorshipPage.jsx'
import OpportunitiesPage from './pages/OpportunitiesPage.jsx'
import PathwaysPage from './pages/PathwaysPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function RootRedirect() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? (
    <Navigate to="/opportunities" replace />
  ) : (
    <Navigate to="/login" replace />
  )
}

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
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
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/opportunities" element={<ProtectedLayout><OpportunitiesPage /></ProtectedLayout>} />
        <Route path="/pathways" element={<ProtectedLayout><PathwaysPage /></ProtectedLayout>} />
        <Route path="/mentorship" element={<ProtectedLayout><MentorshipPage /></ProtectedLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
