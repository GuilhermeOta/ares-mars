import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// No Netlify aparece o selo "Powered by Netlify" no canto inferior direito:
// liga a reserva de espaço definida no index.css (.has-host-badge)
if (window.location.hostname.endsWith('.netlify.app')) {
  document.documentElement.classList.add('has-host-badge')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)