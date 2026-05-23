import { Routes, Route } from "react-router-dom"

import Home_lk from "./pages/home_lk"
import Login from "./pages/login"
import Home from "./pages/home"
import Register from "./pages/register"
import VerifyEmail from "./pages/verify_email"
import Statistics from "./pages/statistics"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/home" element={<Home />} />

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
