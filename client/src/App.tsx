import { Navigate, Route, Routes } from 'react-router'
import { LoginForm } from './components/forms/auth/admin/LoginForm'
import { SignupForm } from './components/forms/auth/admin/SignupForm'
import AuthLayout from './components/layouts/AuthLayout'
import NotFound from './pages/NotFound'
import SalesLoginForm from './components/forms/auth/salesPerson/SalesLoginForm'
import { useAuthStore } from './store/authStore'
import { type JSX } from 'react'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children;
}

const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  // const { checkAuth } = useAuthStore();

  // Check authentication status on app load
  // useEffect(() => {
  //   checkAuth();
  // }, [checkAuth]);
  
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <div>Home Page</div>
        </ProtectedRoute>
      } />

      {/* Auth Layout */}
      <Route element={
        <RedirectIfAuthenticated>
          <AuthLayout />
        </RedirectIfAuthenticated>
      } >
        <Route path="/login" element={<SalesLoginForm />} />

        {/* Admin Auth Forms */}
        <Route path="/admin">
          <Route path="login" element={<LoginForm />} />
          <Route path="signup" element={<SignupForm />} />
        </Route>
      </Route>
      
      {/* Not Found Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
