import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

// Polyfill Buffer for @react-pdf/renderer
window.Buffer = Buffer

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
