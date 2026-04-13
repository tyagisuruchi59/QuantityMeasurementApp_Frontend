import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// @ts-ignore
import Login from './pages/Login'
// @ts-ignore
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}