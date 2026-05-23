import "./login.css"
import "./verify_email.css"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { verifyAndRegister, sendVerificationCode } from "../api"

function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()

  // email и password передаются через state при navigate
  const email = location.state?.email || ""
  const password = location.state?.password || ""

  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef([])

  // Если нет email — редиректим на регистрацию
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true })
    }
  }, [email, navigate])

  // Таймер повторной отправки
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((v) => v - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  function handleCodeChange(index, value) {
    // Принимаем только цифры
    const digit = value.replace(/\D/g, "").slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    setError("")

    // Автофокус на следующее поле
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (code[index]) {
        // Очищаем текущее поле
        const newCode = [...code]
        newCode[index] = ""
        setCode(newCode)
      } else if (index > 0) {
        // Переходим на предыдущее поле
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    const newCode = [...code]
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || ""
    }
    setCode(newCode)
    // Фокус на последнее заполненное поле
    const lastIndex = Math.min(pasted.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  async function handleVerify() {
    const fullCode = code.join("")
    if (fullCode.length < 6) {
      setError("Введите все 6 цифр кода")
      return
    }

    setLoading(true)
    setError("")

    try {
      await verifyAndRegister(email, fullCode)
      navigate("/home_lk", { replace: true })
    } catch (err) {
      setError(err.message || "Неверный или истёкший код")
      // Очищаем поля при ошибке
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return

    setResending(true)
    setError("")

    try {
      await sendVerificationCode(email, password)
      setResendCooldown(60)
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message || "Не удалось отправить код повторно")
    } finally {
      setResending(false)
    }
  }

  function handleKeyDownSubmit(e) {
    if (e.key === "Enter") handleVerify()
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

      <div className="auth-card verify-card">
        <div className="verify-icon" aria-hidden="true">✉️</div>
        <h2>Подтвердите email</h2>
        <p className="verify-subtitle">
          Мы отправили 6-значный код на<br />
          <strong>{email}</strong>
        </p>

        {error && <p className="auth-error">{error}</p>}

        <div className="verify-code-inputs" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              className="verify-code-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => {
                handleKeyDown(index, e)
                handleKeyDownSubmit(e)
              }}
              disabled={loading}
              autoFocus={index === 0}
              aria-label={`Цифра ${index + 1}`}
            />
          ))}
        </div>

        <button
          className="auth-btn"
          onClick={handleVerify}
          disabled={loading || code.join("").length < 6}
        >
          {loading ? "Проверяем..." : "Подтвердить"}
        </button>

        <div className="verify-resend">
          {resendCooldown > 0 ? (
            <p className="verify-resend-timer">
              Отправить повторно через {resendCooldown} сек.
            </p>
          ) : (
            <button
              type="button"
              className="verify-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Отправляем..." : "Отправить код повторно"}
            </button>
          )}
        </div>

        <p className="auth-footer">
          <span onClick={() => navigate("/register")}>← Назад к регистрации</span>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail
