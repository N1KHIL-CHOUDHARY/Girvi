import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Make sure Tailwind is imported here
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext' // <-- 1. Import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <ThemeProvider> 
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-lg rounded-lg',
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
)