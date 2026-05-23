import "./login.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { sendVerificationCode } from "../api"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleRegister() {
    if (!email || !password) {
      setError("Введите email и пароль")
      return
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов")
      return
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setLoading(true)
    setError("")

    try {
      await sendVerificationCode(email, password)
      // Переходим на страницу ввода кода, передаём email и password через state
      navigate("/verify-email", { state: { email, password } })
    } catch (err) {
      if (err.message?.includes("user already exists")) {
        setError("Пользователь с таким email уже существует")
      } else {
        setError(err.message || "Ошибка регистрации")
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleRegister()
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
        <h2>Регистрация</h2>
        <p className="auth-description">
          На ваш email будет отправлен код подтверждения
        </p>

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
          placeholder="Пароль (минимум 6 символов)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <input
          placeholder="Повторите пароль"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button className="auth-btn" onClick={handleRegister} disabled={loading}>
          {loading ? "Отправляем код..." : "Продолжить"}
        </button>

        <p className="auth-footer">
          Есть аккаунт? <span onClick={() => navigate("/")}>Войти</span>
        </p>
      </div>
    </div>
  )
}

export default Register
