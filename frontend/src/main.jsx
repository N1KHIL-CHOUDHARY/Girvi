import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

// --- 1. Import ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// --- 2. Create the client (the "cache") ---
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider> 
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-lg rounded-lg',
            }}
          />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} /> 
      </QueryClientProvider>
    </Router>
  </React.StrictMode>
);