import { Route, Routes } from 'react-router'
import { LoginForm } from './components/forms/auth/admin/LoginForm'
import { SignupForm } from './components/forms/auth/admin/SignupForm'
import AuthLayout from './components/layouts/AuthLayout'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />

      {/* Auth Layout */}
      <Route element={<AuthLayout />} >
        <Route path="/admin/login" element={<LoginForm />} />
        <Route path="/admin/signup" element={<SignupForm />} />
      </Route>
      
      {/* Not Found Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
