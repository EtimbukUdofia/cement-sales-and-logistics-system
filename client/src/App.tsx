import { Route, Routes } from 'react-router'
import { LoginForm } from './components/forms/auth/admin/LoginForm'
import { SignupForm } from './components/forms/auth/admin/SignupForm'
import AuthLayout from './components/layouts/AuthLayout'
import NotFound from './pages/NotFound'
import SalesLoginForm from './components/forms/auth/salesPerson/SalesLoginForm'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />

      {/* Auth Layout */}
      <Route element={<AuthLayout />} >
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
