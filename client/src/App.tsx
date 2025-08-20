import { Route, Routes } from 'react-router'
import { LoginForm } from './components/forms/auth/LoginForm'
import { SignupForm } from './components/forms/auth/SignupForm'
import AuthLayout from './components/layouts/AuthLayout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />

      {/* Auth Layout */}
      <Route element={<AuthLayout />} >
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Route>
      
    </Routes>
  )
}

export default App
