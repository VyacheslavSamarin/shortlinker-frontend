import "./login.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { login } from "../api"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    if (!email || !password) {
      setError("Введите email и пароль")
      return
    }

    setLoading(true)
    setError("")

    try {
      await login(email, password)
      navigate("/home_lk")
    } catch (err) {
      setError(err.message || "Ошибка входа. Проверьте данные.")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <img
          className="logo"
          src="https://placehold.co/160x40/f4f4f5/09090b?text=ShortLinker"
          alt="ShortLinker"
        />
      </div>

      <div className="auth-card">
        <h2>Вход</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button className="auth-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>

        <p className="auth-footer">
          Нет аккаунта?{" "}
          <span onClick={() => navigate("/register")}>Зарегистрироваться</span>
        </p>

        <p className="auth-footer">
          <span onClick={() => navigate("/home")}>Продолжить без регистрации</span>
        </p>
      </div>
    </div>
  )
}

export default Login
