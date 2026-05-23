import { Routes, Route, Navigate } from "react-router-dom"

import Home_lk from "./pages/home_lk"
import Login from "./pages/login"
import Home from "./pages/home"
import Register from "./pages/register"
import VerifyEmail from "./pages/verify_email"
import Statistics from "./pages/statistics"
import ProtectedRoute from "./components/ProtectedRoute"
import { isAuthenticated } from "./api"

// Маршрут только для неавторизованных — авторизованных кидает в ЛК
function GuestRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/home_lk" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      {/* Публичные маршруты — только для гостей */}
      <Route path="/" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/verify-email" element={<GuestRoute><VerifyEmail /></GuestRoute>} />
      <Route path="/home" element={<GuestRoute><Home /></GuestRoute>} />

      {/* Защищённые маршруты — требуют JWT */}
      <Route
        path="/home_lk"
        element={
          <ProtectedRoute>
            <Home_lk />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics/:alias"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />
      {/* Обратная совместимость со старым маршрутом без alias */}
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
