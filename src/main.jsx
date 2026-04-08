import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './services/AuthProvider'
import { UtaProvider  } from './services/UtaProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UtaProvider>
        <App />
      </UtaProvider>
    </AuthProvider>
  </StrictMode>,
)