import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGuard from '@/components/PermissionGuard';
import AppLayout from '@/layouts/appLayout';

// 🔹 EAGER (auth / entry)
import Landingpage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';

// 🔹 LAZY (post-login / heavy)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AllCustomers = lazy(() => import('@/pages/AllCustomer'));
const CustomerDetail = lazy(() => import('@/pages/CustomerDetail'));
const NewCustomer = lazy(() => import('@/pages/NewCustomer'));
const UpdateCustomer = lazy(() => import('@/pages/UpdateCustomer'));

const AllPawns = lazy(() => import('@/pages/AllPawn'));
const PawnDetail = lazy(() => import('@/pages/PawnDetail'));
const NewPawn = lazy(() => import('@/pages/NewPawn'));
const UpdatePawn = lazy(() => import('@/pages/UpdatePawn'));

const Payments = lazy(() => import('@/pages/Payments'));
const Employees = lazy(() => import('@/pages/Employee'));
const Roles = lazy(() => import('@/pages/Roles'));
const Settings = lazy(() => import('@/pages/Setting'));

// 🔹 Loader used only for lazy pages
const PageLoader = () => (
  <div className="flex h-full items-center justify-center text-app-primary">
    Loading…
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== Public ===== */}
      <Route path="/" element={<Landingpage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ===== Protected App ===== */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />

        {/* ---- Customers ---- */}
        <Route
          path="customers"
          element={
            <Suspense fallback={<PageLoader />}>
              <AllCustomers />
            </Suspense>
          }
        />

        <Route
          path="customer/add"
          element={
            <PermissionGuard requiredPermission="can_create_customers">
              <Suspense fallback={<PageLoader />}>
                <NewCustomer />
              </Suspense>
            </PermissionGuard>
          }
        />

        <Route
          path="customer/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <CustomerDetail />
            </Suspense>
          }
        />

        <Route
          path="customer/update/:id"
          element={
            <PermissionGuard requiredPermission="can_edit_customers">
              <Suspense fallback={<PageLoader />}>
                <UpdateCustomer />
              </Suspense>
            </PermissionGuard>
          }
        />

        {/* ---- Pawns ---- */}
        <Route
          path="pawns"
          element={
            <Suspense fallback={<PageLoader />}>
              <AllPawns />
            </Suspense>
          }
        />

        <Route
          path="pawns/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <PawnDetail />
            </Suspense>
          }
        />

        <Route
          path="pawn/add"
          element={
            <PermissionGuard requiredPermission="can_create_tickets">
              <Suspense fallback={<PageLoader />}>
                <NewPawn />
              </Suspense>
            </PermissionGuard>
          }
        />

        <Route
          path="pawn/update/:id"
          element={
            <PermissionGuard requiredPermission="can_edit_tickets">
              <Suspense fallback={<PageLoader />}>
                <UpdatePawn />
              </Suspense>
            </PermissionGuard>
          }
        />

        {/* ---- Other ---- */}
        <Route
          path="payments"
          element={
            <PermissionGuard requiredPermission="can_view_reports">
              <Suspense fallback={<PageLoader />}>
                <Payments />
              </Suspense>
            </PermissionGuard>
          }
        />

        <Route
          path="employees"
          element={
            <PermissionGuard requiredPermission="can_manage_employees">
              <Suspense fallback={<PageLoader />}>
                <Employees />
              </Suspense>
            </PermissionGuard>
          }
        />

        <Route
          path="roles"
          element={
            <PermissionGuard requiredPermission="can_manage_roles">
              <Suspense fallback={<PageLoader />}>
                <Roles />
              </Suspense>
            </PermissionGuard>
          }
        />

        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>

      {/* ===== Fallback ===== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
