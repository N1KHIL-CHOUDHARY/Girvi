import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGuard from '@/components/PermissionGuard';

import AppLayout from '@/layouts/AppLayout';

// Pages
import Landingpage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import AllCustomers from '@/pages/AllCustomer';
import AllPawns from '@/pages/AllPawn';
import PawnDetail from '@/pages/PawnDetail';
import Payments from '@/pages/Payments';
import NotFound from '@/pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landingpage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected app routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<AllCustomers />} />
        <Route path="pawns" element={<AllPawns />} />
        <Route path="pawns/:id" element={<PawnDetail />} />

        <Route
          path="payments"
          element={
            <PermissionGuard requiredPermission="can_view_reports">
              <Payments />
            </PermissionGuard>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
