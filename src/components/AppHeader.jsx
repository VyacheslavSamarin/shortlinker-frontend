import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./AppHeader.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8082"

function AppHeader({
  center,
  userLabel = "Username",
  onUserClick,
  userClickable = false,
  showUserMenu = false,
  onShortenLink,
  onViewStats,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Закрываем меню при клике вне него
  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  function handleLogoClick() {
    // Если пользователь авторизован — остаёмся в личном кабинете
    const token = localStorage.getItem("token")
    navigate(token ? "/home_lk" : "/home")
  }

  function handleMenuAction(action) {
    setMenuOpen(false)
    action?.()
  }

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__logo-btn"
          onClick={handleLogoClick}
          aria-label="ShortLinker — на главную"
        >
          <span className="app-header__logo-text">ShortLinker</span>
        </button>
        <a
          href={`${API_URL}/swagger/`}
          target="_blank"
          rel="noopener noreferrer"
          className="app-header__api-badge"
          title="Открыть Swagger UI"
        >
          API
        </a>
      </div>

      {center && <div className="app-header__center">{center}</div>}

      {showUserMenu ? (
        <div className="app-header__user-wrap" ref={menuRef}>
          <button
            type="button"
            className="app-header__user"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <img
              className="app-header__avatar"
              src="https://placehold.co/32x32/f4f4f5/71717a?text=U"
              alt=""
            />
            <span className="app-header__label">{userLabel}</span>
            <svg
              className={`app-header__chevron${menuOpen ? " app-header__chevron--open" : ""}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className="app-header__dropdown" role="menu">
              <button
                type="button"
                className="app-header__dropdown-item"
                role="menuitem"
                onClick={() => handleMenuAction(onShortenLink)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Сократить ссылку
              </button>
              <button
                type="button"
                className="app-header__dropdown-item"
                role="menuitem"
                onClick={() => handleMenuAction(onViewStats)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="9" width="3" height="5" rx="1" fill="currentColor" />
                  <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" />
                  <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
                </svg>
                Посмотреть статистику
              </button>
              <div className="app-header__dropdown-divider" />
              <button
                type="button"
                className="app-header__dropdown-item app-header__dropdown-item--danger"
                role="menuitem"
                onClick={() => handleMenuAction(onLogout)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Выйти
              </button>
            </div>
          )}
        </div>
      ) : userClickable || onUserClick ? (
        <button type="button" className="app-header__user" onClick={onUserClick}>
          <img
            className="app-header__avatar"
            src="https://placehold.co/32x32/f4f4f5/71717a?text=U"
            alt=""
          />
          <span className="app-header__label">{userLabel}</span>
        </button>
      ) : (
        <div className="app-header__user">
          <img
            className="app-header__avatar"
            src="https://placehold.co/32x32/f4f4f5/71717a?text=U"
            alt=""
          />
          <span className="app-header__label">{userLabel}</span>
        </div>
      )}
    </header>
  )
}

export default AppHeader
