import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ReactQueryDevtools =
  import.meta.env.DEV
    ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
    : () => null;

ReactDOM.createRoot(document.getElementById('root')).render(
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
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </Suspense>
        )}
      </QueryClientProvider>
    </Router>
  </React.StrictMode>
);