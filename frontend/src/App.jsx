import React from 'react';
import { Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login';     // Was './pages/login'
import Signup from './pages/Signup';   // Was './pages/signup'

import Dashboard from './pages/Dashboard';
import NewCustomer from './pages/NewCustomer';
import NewPawn from './pages/NewPawn';

// Import Components
import ProtectedRoute from './components/ProtectedRoute';


const AppLayout = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ display: 'flex' }}>
      <nav style={{ width: '200px', borderRight: '1px solid #ccc', padding: '1rem' }}>
        <h3>PawnManager</h3>
        <p>Welcome, {user?.full_name}!</p>
        <ul>
          <li><Link to="/app/dashboard">Dashboard</Link></li>
          <li><Link to="/app/customers/new">New Customer</Link></li>
          <li><Link to="/app/pawns/new">New Pawn</Link></li>
        </ul>
        <button onClick={logout}>Logout</button>
      </nav>
      <main style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes: Anyone can see these */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      
    
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        
       
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers/new" element={<NewCustomer />} />
        <Route path="pawns/new" element={<NewPawn />} />
      </Route>
      
      
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;