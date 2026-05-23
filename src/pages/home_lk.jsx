import { useState, useEffect, useCallback, useRef } from "react"
import "./home.css"
import "./home_lk.css"
import AppHeader from "../components/AppHeader"
import LinkCard from "../components/LinkCard"
import SettingsSidebar from "../components/SettingsSidebar"
import { shortenUrl, getUserUrls, deleteUrl, logoutApi, getUser } from "../api"
import { useNavigate, useLocation } from "react-router-dom"

function Home_lk() {
  const [url, setUrl] = useState("")
  const [links, setLinks] = useState([])
  const [sidebar, setSidebar] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeQR, setActiveQR] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fetchingLinks, setFetchingLinks] = useState(true)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const user = getUser()

  const loadLinks = useCallback(async () => {
    setFetchingLinks(true)
    try {
      const urls = await getUserUrls()
      setLinks(urls)
    } catch (err) {
      if (err.message?.includes("401") || err.message?.includes("unauthorized")) {
        await logoutApi()
        navigate("/")
      }
    } finally {
      setFetchingLinks(false)
    }
  }, [navigate])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  // Открываем модалку статистики если пришли с ?stats=1
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("stats") === "1") {
      setShowStatsModal(true)
      // Убираем параметр из URL без перезагрузки
      navigate("/home_lk", { replace: true })
    }
  }, [location.search, navigate])

  async function handleShorten() {
    if (!url) return

    setLoading(true)
    setError("")

    try {
      await shortenUrl(url)
      await loadLinks()
      setUrl("")
    } catch (err) {
      setError(err.message || "Не удалось сократить ссылку")
    } finally {
      setLoading(false)
    }
  }

  function handleQRColorsSaved(alias, fg, bg) {
    setLinks((prev) =>
      prev.map((l) => (l.alias === alias ? { ...l, qr_fg: fg, qr_bg: bg } : l))
    )
    setSelectedItem((prev) =>
      prev?.alias === alias ? { ...prev, qr_fg: fg, qr_bg: bg } : prev
    )
  }

  async function handleDelete(alias) {
    try {
      await deleteUrl(alias)
      setLinks((prev) => prev.filter((l) => l.alias !== alias))
    } catch (err) {
      setError(err.message || "Не удалось удалить ссылку")
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleShorten()
  }

  async function handleLogout() {
    await logoutApi()
    navigate("/")
  }

  function handleMenuShortenLink() {
    inputRef.current?.focus()
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  function handleMenuViewStats() {
    setShowStatsModal(true)
  }

  function toggleQR(id) {
    setActiveQR(activeQR === id ? null : id)
  }

  return (
    <div className="dashboard">
      <AppHeader
        userLabel={user?.email || "Профиль"}
        showUserMenu
        onShortenLink={handleMenuShortenLink}
        onViewStats={handleMenuViewStats}
        onLogout={handleLogout}
      />

      <div className="dashboard__content">
        <div className="shortener">
          <input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Вставьте ссылку для сокращения"
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleShorten}
            disabled={loading || !url}
          >
            {loading ? "Сокращаем..." : "Сократить"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="cards">
          {fetchingLinks ? (
            <p className="loading-message">Загрузка ссылок...</p>
          ) : links.length === 0 ? (
            <p className="empty-message">У вас пока нет сокращённых ссылок</p>
          ) : (
            links.map((item) => (
              <LinkCard
                key={item.id}
                item={item}
                onOpenSidebar={(type, linkItem) => {
                  setSelectedItem(linkItem)
                  setSidebar(type)
                }}
                activeQR={activeQR}
                onToggleQR={toggleQR}
                onDelete={handleDelete}
                showQrPopup
              />
            ))
          )}
        </div>
      </div>

      <SettingsSidebar
        sidebar={sidebar}
        onClose={() => { setSidebar(null); setSelectedItem(null) }}
        item={selectedItem}
        onQRColorsSaved={handleQRColorsSaved}
      />

      {/* Модальное окно выбора ссылки для статистики */}
      {showStatsModal && (
        <div
          className="stats-modal-overlay"
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="stats-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="stats-modal-title"
            aria-modal="true"
          >
            <div className="stats-modal__header">
              <h2 id="stats-modal-title" className="stats-modal__title">
                Выберите ссылку
              </h2>
              <button
                type="button"
                className="stats-modal__close"
                onClick={() => setShowStatsModal(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {fetchingLinks ? (
              <p className="loading-message">Загрузка ссылок...</p>
            ) : links.length === 0 ? (
              <p className="empty-message">У вас пока нет сокращённых ссылок</p>
            ) : (
              <ul className="stats-modal__list">
                {links.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="stats-modal__item"
                      onClick={() => {
                        setShowStatsModal(false)
                        navigate(`/statistics/${item.alias}`)
                      }}
                    >
                      <span className="stats-modal__short">{item.short_url || item.alias}</span>
                      {item.url && (
                        <span className="stats-modal__original">
                          {item.url.length > 55 ? item.url.slice(0, 55) + "…" : item.url}
                        </span>
                      )}
                      <span className="stats-modal__clicks">{item.clicks ?? 0} переходов</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home_lk
