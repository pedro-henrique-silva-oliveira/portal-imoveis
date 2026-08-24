import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { BRAND_NAME, PRIMARY_COLOR, SECONDARY_COLOR } from './config/brand'
import './index.css'

document.documentElement.style.setProperty('--color-primary', PRIMARY_COLOR)
document.documentElement.style.setProperty('--color-secondary', SECONDARY_COLOR)
document.title = BRAND_NAME

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
