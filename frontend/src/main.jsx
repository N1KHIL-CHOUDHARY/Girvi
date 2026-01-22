import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// --- 1. Import ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// --- 2. Create the client (the "cache") ---
const queryClient = new QueryClient();



function AppWithCSSReady() {
  const [cssReady, setCssReady] = useState(false);

  useEffect(() => {
    // Check if CSS is loaded by verifying computed styles and CSS variables
    const checkCSSReady = () => {
      const testEl = document.createElement('div');
      testEl.className = 'app-surface';
      testEl.style.position = 'absolute';
      testEl.style.visibility = 'hidden';
      testEl.style.top = '-9999px';
      document.body.appendChild(testEl);

      const computedStyle = window.getComputedStyle(testEl);
      const bgColor = computedStyle.backgroundColor;
      const borderColor = computedStyle.borderColor;
      
      // CSS variables should be resolved to actual colors (not empty/rgba(0,0,0,0))
      const hasStyles = 
        bgColor && 
        bgColor !== 'rgba(0, 0, 0, 0)' && 
        bgColor !== 'transparent' &&
        bgColor !== 'initial' &&
        borderColor &&
        borderColor !== 'rgba(0, 0, 0, 0)';
      
      document.body.removeChild(testEl);
      return hasStyles;
    };

    // Try immediately (CSS might already be loaded in dev mode)
    if (checkCSSReady()) {
      setCssReady(true);
      return;
    }

    // If not ready, poll until CSS is loaded (max 500ms)
    let checkCount = 0;
    const maxChecks = 50;
    const checkInterval = setInterval(() => {
      checkCount++;
      if (checkCSSReady() || checkCount >= maxChecks) {
        clearInterval(checkInterval);
        setCssReady(true);
      }
    }, 10);

    // Fallback: ensure we render after DOMContentLoaded
    const handleDOMReady = () => {
      clearInterval(checkInterval);
      setCssReady(true);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMReady, { once: true });
    } else {
      // DOM already ready, give CSS one more frame to load
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clearInterval(checkInterval);
          setCssReady(true);
        });
      });
    }

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('DOMContentLoaded', handleDOMReady);
    };
  }, []);

  if (!cssReady) {
    return null;
  }

  return (
    <React.StrictMode>
      <Router>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'app-surface shadow-lg rounded-lg',
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </Router>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppWithCSSReady />);