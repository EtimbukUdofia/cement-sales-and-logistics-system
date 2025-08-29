import { Navigate, Outlet, Route, Routes } from 'react-router'
import { LoginForm } from './components/forms/auth/admin/LoginForm'
import { SignupForm } from './components/forms/auth/admin/SignupForm'
import AuthLayout from './components/layouts/AuthLayout'
import NotFound from './pages/NotFound'
import { useAuthStore } from './store/authStore'
import { useEffect, type JSX } from 'react'
import LoadingSpinner from './components/LoadingSpinner'
import Dashboard from './pages/Admin/dashboard/Dashboard'
import MainLayout from './components/layouts/MainLayout'
import ProductsPage from './pages/Admin/Products'
import SuppliersPage from './pages/Admin/Suppliers'
import OrdersPage from './pages/Admin/Orders'
import UserManagementPage from './pages/Admin/UserManagement'
import InventoryPage from './pages/Admin/Inventory/InventoryPage'
import RoutesPage from './pages/Admin/Routes/RoutesPage'

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
        <Route path="/admin" element={<MainLayout />} >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="shops" element={<div>Manage shops page</div>} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/create" element={<div>Create Purchase Order Page</div>} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="trucks" element={<div>Truck Page</div>} />
          <Route path="reports" element={<div>View Reports Page</div>} />
          <Route path="user-roles" element={<UserManagementPage />} />
        </Route>

        {/* Sales Routes */}
        <Route path="/sales" element={<MainLayout />} >
          <Route index element={<div>Sales Dashboard</div>} />
          <Route path="customers" element={<div>Manage Customers Page</div>} />
          <Route path="orders" element={<div>Manage Sales Orders Page</div>} />
          <Route path="deliveries" element={<div>Manage Deliveries Page</div>} />
          <Route path="invoices" element={<div>Manage Invoices Page</div>} />
          <Route path="payments" element={<div>Manage Payments Page</div>} />
          <Route path="reports" element={<div>View Reports Page</div>} />
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
