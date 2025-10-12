import { Navigate, Outlet, Route, Routes } from 'react-router'
import { useEffect, type JSX } from 'react'

import { LoginForm } from './components/forms/auth/admin/LoginForm'
import { SignupForm } from './components/forms/auth/admin/SignupForm'
import AuthLayout from './components/layouts/AuthLayout'
import NotFound from './pages/NotFound'
import { useAuthStore } from './store/authStore'
import LoadingSpinner from './components/LoadingSpinner'
import Dashboard from './pages/Admin/dashboard/Dashboard'
import MainLayout from './components/layouts/MainLayout'
import ProductsPage from './pages/Admin/Products'
import SuppliersPage from './pages/Admin/Suppliers'
import OrdersPage from './pages/Admin/Orders'
import UserManagementPage from './pages/Admin/UserManagement'
import InventoryPage from './pages/Admin/Inventory/InventoryPage'
import RoutesPage from './pages/Admin/Routes/RoutesPage'
import TrucksPage from './pages/Admin/Trucks/TrucksPage'
import SalesInventoryPage from './pages/Sales/Inventory/SalesInventoryPage'
import SalesOrdersPage from './pages/Sales/Orders/SalesOrdersPage'
import ReportsPage from './pages/Admin/Reports/ReportsPage'
import SalesHistoryPage from './pages/Sales/Reports/SalesHistoryPage'
import ShopsPage from './pages/Admin/Shops/ShopsPage'

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />;
}

const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/sales" replace />;
  }

  return children;
}

// check allowed roles for a route
const RoleBasedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user } = useAuthStore();
  if (user && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Auth Layout */}
      <Route element={
        <RedirectIfAuthenticated>
          <AuthLayout />
        </RedirectIfAuthenticated>
      } >
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route element={<RoleBasedRoute allowedRoles={['admin']} />} >
          <Route path="/admin" element={<MainLayout />} >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="shops" element={<ShopsPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/create" element={<div>Create Purchase Order Page</div>} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="trucks" element={<TrucksPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="user-roles" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* Sales Routes */}
        <Route element={<RoleBasedRoute allowedRoles={['salesPerson']} />} >
          <Route path="/sales" element={<MainLayout />} >
            <Route index element={<div>Sales Dashboard</div>} />
            {/* <Route path="customers" element={<div>Manage Customers Page</div>} /> */}
            <Route path="orders" element={<SalesOrdersPage />} />
            <Route path="inventory" element={<SalesInventoryPage />} />
            <Route path="history" element={<SalesHistoryPage />} />
            <Route path="deliveries" element={<div>Manage Deliveries Page</div>} />
            {/* <Route path="invoices" element={<div>Manage Invoices Page</div>} />
          <Route path="payments" element={<div>Manage Payments Page</div>} /> */}
          </Route>
        </Route>
      </Route>

      {/* Redirect for root path */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Not Found Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
