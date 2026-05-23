import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./home.css"
import "./statistics.css"
import "./home_lk.css"
import AppHeader from "../components/AppHeader"
import LinkCard from "../components/LinkCard"
import SettingsSidebar from "../components/SettingsSidebar"
import AliasModal from "../components/AliasModal"
import { getStats, getUserUrls, logoutApi, getUser } from "../api"

function Statistics() {
  const [sidebar, setSidebar] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeQR, setActiveQR] = useState(null)
  const [visits, setVisits] = useState([])
  const [linkInfo, setLinkInfo] = useState(null)
  const [allLinks, setAllLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [aliasModalItem, setAliasModalItem] = useState(null)
  const navigate = useNavigate()
  const { alias } = useParams()

  const user = getUser()

  useEffect(() => {
    if (!alias) return

    async function loadData() {
      setLoading(true)
      setError("")
      try {
        const [visitsData, urls] = await Promise.all([
          getStats(alias),
          getUserUrls(),
        ])
        setVisits(visitsData || [])
        setAllLinks(urls || [])
        const found = urls.find((u) => u.alias === alias)
        if (found) setLinkInfo(found)
      } catch (err) {
        setError(err.message || "Не удалось загрузить статистику")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [alias])

  function toggleQR(id) {
    setActiveQR(activeQR === id ? null : id)
  }

  async function handleLogout() {
    await logoutApi()
    navigate("/")
  }

  function handleShortenLink() {
    navigate("/home_lk")
  }

  function handleViewStats() {
    setShowStatsModal(true)
  }

  function handleAliasSaved(oldAlias, newAlias) {
    setAliasModalItem(null)
    // Редиректим на страницу статистики с новым alias
    navigate(`/statistics/${newAlias}`, { replace: true })
  }

  // Агрегируем статистику по странам
  const countryCounts = visits.reduce((acc, v) => {
    const key = v.country || "Неизвестно"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const countries = Object.entries(countryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Агрегируем статистику по браузерам
  const browserCounts = visits.reduce((acc, v) => {
    const key = v.browser || "Неизвестно"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const browsers = Object.entries(browserCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Агрегируем по устройствам
  const deviceCounts = visits.reduce((acc, v) => {
    const key = v.device_type || "desktop"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const devices = Object.entries(deviceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const maxCountry = countries[0]?.value || 1
  const maxBrowser = browsers[0]?.value || 1
  const maxDevice = devices[0]?.value || 1

  const displayLink = linkInfo || {
    id: alias,
    alias: alias,
    url: "",
    short_url: "",
    clicks: visits.length,
  }

  return (
    <div className="dashboard">
      <AppHeader
        center={
          <div className="all-links-link" onClick={() => navigate("/home_lk")}>
            <span>← Все ссылки</span>
          </div>
        }
        userLabel={user?.email || "Профиль"}
        showUserMenu
        onShortenLink={handleShortenLink}
        onViewStats={handleViewStats}
        onLogout={handleLogout}
      />

      <div className="dashboard__content">
        {loading ? (
          <p className="loading-message">Загрузка статистики...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <LinkCard
              item={displayLink}
              onOpenSidebar={(type, linkItem) => {
                setSelectedItem(linkItem)
                setSidebar(type)
              }}
              activeQR={activeQR}
              onToggleQR={toggleQR}
              onEditAlias={setAliasModalItem}
              showQrPopup
              showAliasEdit
            />

            <div className="stats-summary">
              <span className="stats-summary__total">
                Всего переходов: <strong>{visits.length}</strong>
              </span>
            </div>

            {countries.length > 0 && (
              <section className="statistics-section">
                <h2 className="statistics-section__title">Переходы по странам</h2>
                <div className="chart-panel">
                  <div className="chart">
                    {countries.map((c) => (
                      <div key={c.name} className="bar-row">
                        <div className="bar-label">{c.name}</div>
                        <div className="bar-bg">
                          <div
                            className="bar-fill"
                            style={{ width: `${(c.value / maxCountry) * 100}%` }}
                          />
                        </div>
                        <div className="bar-value">{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {browsers.length > 0 && (
              <section className="statistics-section">
                <h2 className="statistics-section__title">Переходы по браузерам</h2>
                <div className="chart-panel">
                  <div className="chart">
                    {browsers.map((b) => (
                      <div key={b.name} className="bar-row">
                        <div className="bar-label">{b.name}</div>
                        <div className="bar-bg">
                          <div
                            className="bar-fill"
                            style={{ width: `${(b.value / maxBrowser) * 100}%` }}
                          />
                        </div>
                        <div className="bar-value">{b.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {devices.length > 0 && (
              <section className="statistics-section">
                <h2 className="statistics-section__title">Переходы по устройствам</h2>
                <div className="chart-panel">
                  <div className="chart">
                    {devices.map((d) => (
                      <div key={d.name} className="bar-row">
                        <div className="bar-label">{d.name}</div>
                        <div className="bar-bg">
                          <div
                            className="bar-fill"
                            style={{ width: `${(d.value / maxDevice) * 100}%` }}
                          />
                        </div>
                        <div className="bar-value">{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {visits.length === 0 && (
              <p className="empty-message">По этой ссылке ещё не было переходов</p>
            )}
          </>
        )}
      </div>

      <SettingsSidebar
        sidebar={sidebar}
        onClose={() => { setSidebar(null); setSelectedItem(null) }}
        item={selectedItem}
        onQRColorsSaved={(updatedAlias, fg, bg) => {
          if (linkInfo?.alias === updatedAlias) {
            setLinkInfo((prev) => ({ ...prev, qr_fg: fg, qr_bg: bg }))
          }
        }}
      />

      <AliasModal
        item={aliasModalItem}
        onClose={() => setAliasModalItem(null)}
        onSaved={handleAliasSaved}
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

            {allLinks.length === 0 ? (
              <p className="empty-message">У вас пока нет сокращённых ссылок</p>
            ) : (
              <ul className="stats-modal__list">
                {allLinks.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`stats-modal__item${item.alias === alias ? " stats-modal__item--active" : ""}`}
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

export default Statistics
