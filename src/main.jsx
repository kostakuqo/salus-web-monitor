import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Header from './assets/comonents/Header/Header.jsx'
import Menu from './assets/comonents/menu-left/menu.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
    
  </StrictMode>,
)
