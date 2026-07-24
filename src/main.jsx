import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import logo from './assets/bridge-edu.png'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

// set favicon to the bundled asset so production builds point to the hashed file
try {
  const existing = document.querySelector('link[rel="icon"]')
  if (existing) {
    existing.href = logo
  } else {
    const l = document.createElement('link')
    l.rel = 'icon'
    l.href = logo
    document.head.appendChild(l)
  }
} catch (err) {
  // ignore
}
