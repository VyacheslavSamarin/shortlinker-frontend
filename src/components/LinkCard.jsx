import { useState } from "react"
import { useNavigate } from "react-router-dom"
import linkIcon from "../assets/icons/link.png"
import miniqrIcon from "../assets/icons/qr-code.png"
import statisticsIcon from "../assets/icons/statistics.png"
import { getQRCodeSrc, BASE_URL } from "../api"

function LinkCard({
  item,
  onOpenSidebar,
  activeQR,
  onToggleQR,
  onDelete,
  onEditAlias,
  showAnalytics = false,
  showQrPopup = false,
  showQrSettings = true,
  showAliasEdit = false,
}) {
  const showAside = showAnalytics || showQrPopup
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [qrFormat, setQrFormat] = useState("png")

  // Поддержка обоих форматов данных: из бэкенда (alias/url/short_url) и локального (short)
  const alias = item.alias || (item.short ? item.short.split("/").pop() : null)
  const shortUrl = item.short_url || item.short || (alias ? `${BASE_URL}/${alias}` : "")
  const originalUrl = item.url || item.original || ""
  const clicks = item.clicks ?? 0

  const qrSrc = alias
    ? getQRCodeSrc(alias, {
        fg: item.qr_fg ? `#${item.qr_fg}` : "#000000",
        bg: item.qr_bg ? `#${item.qr_bg}` : "#ffffff",
      })
    : null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback для старых браузеров
      const el = document.createElement("textarea")
      el.value = shortUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleDownloadQR() {
    if (!alias) return
    try {
      const res = await fetch(getQRCodeSrc(alias, {
        fg: item.qr_fg ? `#${item.qr_fg}` : "#000000",
        bg: item.qr_bg ? `#${item.qr_bg}` : "#ffffff",
      }))
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `qr-${alias}.${qrFormat}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to download QR:", err)
    }
  }

  function handleStatsClick() {
    navigate(`/statistics/${alias}`)
  }

  return (
    <article className="link-card">
      <div className="link-card__body">
        <div className="link-card__main">
          <div className="link-card__info">
            <img
              className="link-card__icon"
              src={linkIcon}
              alt=""
            />
            <div className="link-card__urls">
              <div className="link-card__short">
                <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                  {shortUrl}
                </a>
              </div>
              {originalUrl && (
                <div className="link-card__original" title={originalUrl}>
                  {originalUrl.length > 60 ? originalUrl.slice(0, 60) + "…" : originalUrl}
                </div>
              )}
            </div>
          </div>

          <div className="link-card__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCopy}
            >
              {copied ? "Скопировано!" : "Копировать"}
            </button>
            {showAliasEdit && alias && onEditAlias && (
              <button
                type="button"
                className="btn btn--icon"
                onClick={() => onEditAlias(item)}
                aria-label="Изменить alias"
                title="Изменить alias"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 6h9M3 6l2.5-2.5M3 6l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12H6M15 12l-2.5-2.5M15 12l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            {showQrSettings && (
              <button
                type="button"
                className="btn btn--icon"
                onClick={() => onOpenSidebar("QRSettings", item)}
                aria-label="Настройки QR"
              >
                <img src={miniqrIcon} alt="" />
              </button>
            )}
            {onDelete && alias && (
              <button
                type="button"
                className="btn btn--icon btn--danger"
                onClick={() => onDelete(alias)}
                aria-label="Удалить ссылку"
                title="Удалить"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {showAside && (
          <div className="link-card__aside">
            {showAnalytics && (
              <>
                <span className="link-card__clicks">{clicks} переходов</span>
                <button
                  type="button"
                  className="link-card__stats-btn"
                  onClick={handleStatsClick}
                  aria-label="Статистика"
                >
                  <img
                    className="link-card__stats-icon"
                    src={statisticsIcon}
                    alt=""
                  />
                </button>
              </>
            )}

            {showQrPopup && alias && (
              <div className="qr-wrapper">
                <button
                  type="button"
                  className="link-card__qr"
                  onClick={() => onToggleQR(item.id)}
                  aria-label="QR-код"
                >
                  <img
                    src={qrSrc}
                    alt="QR"
                    width={72}
                    height={72}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/72x72/fafafa/09090b?text=QR"
                    }}
                  />
                </button>

                {activeQR === item.id && (
                  <div className="qr-popup">
                    <div className="qr-popup__title">Экспорт QR-кода</div>
                    <div className="qr-popup__preview">
                      <img src={qrSrc} alt="QR preview" width={160} height={160} />
                    </div>
                    <div className="qr-popup__actions">
                      <button
                        type="button"
                        className={qrFormat === "jpg" ? "active" : ""}
                        onClick={() => setQrFormat("jpg")}
                      >
                        JPG
                      </button>
                      <button
                        type="button"
                        className={qrFormat === "png" ? "active" : ""}
                        onClick={() => setQrFormat("png")}
                      >
                        PNG
                      </button>
                      <button
                        type="button"
                        className="qr-popup__download"
                        onClick={handleDownloadQR}
                        aria-label="Скачать"
                      >
                        ⬇
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default LinkCard
