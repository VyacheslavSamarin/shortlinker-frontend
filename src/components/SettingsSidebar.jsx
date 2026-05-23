import { useState, useEffect } from "react"
import ColorPicker from "./ColorPicker"
import { getQRCodeSrc, saveQRColors } from "../api"
import "./SettingsSidebar.css"

/**
 * SettingsSidebar
 * @param {"QRSettings"|null} sidebar — какой сайдбар открыт
 * @param {function} onClose
 * @param {object|null} item — текущая ссылка { alias, url, short_url, qr_fg, qr_bg, ... }
 * @param {function} onQRColorsSaved — колбэк после успешного сохранения цветов (alias, fg, bg)
 */
function SettingsSidebar({ sidebar, onClose, item, onQRColorsSaved }) {
  // ── Параметры QR ───────────────────────────────────────────────────────────
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [qrSrc, setQrSrc] = useState(null)
  const [qrSaved, setQrSaved] = useState(false)
  const [qrError, setQrError] = useState("")

  const alias = item?.alias || (item?.short ? item.short.split("/").pop() : null)

  // Инициализируем цвета из item при его смене
  useEffect(() => {
    const fg = item?.qr_fg ? `#${item.qr_fg}` : "#000000"
    const bg = item?.qr_bg ? `#${item.qr_bg}` : "#ffffff"
    setFgColor(fg)
    setBgColor(bg)
    setQrSaved(false)
    setQrError("")
  }, [alias])

  // Обновляем превью QR при смене цветов или alias
  useEffect(() => {
    if (!alias) {
      setQrSrc(null)
      return
    }
    setQrSrc(getQRCodeSrc(alias, { fg: fgColor, bg: bgColor }))
  }, [alias, fgColor, bgColor])

  async function handleSaveQrColors() {
    if (!alias) return
    setQrError("")
    try {
      await saveQRColors(alias, fgColor, bgColor)
      setQrSaved(true)
      setTimeout(() => setQrSaved(false), 2000)
      // Уведомляем родителя чтобы обновить item в списке
      onQRColorsSaved?.(alias, fgColor.replace("#", ""), bgColor.replace("#", ""))
    } catch (err) {
      setQrError(err.message || "Не удалось сохранить цвета")
    }
  }

  return (
    <>
      {sidebar && <div className="overlay" onClick={onClose} />}

      {/* ── Параметры QR-кода ── */}
      <aside className={`sidebar ${sidebar === "QRSettings" ? "open" : ""}`}>
        <div className="sidebar__header">
          <h2 className="sidebar__title">Параметры QR-кода</h2>
          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="sidebar__row">
          <ColorPicker value={fgColor} onChange={setFgColor} />
          <span className="sidebar__label">Цвет кода</span>
        </div>

        <div className="sidebar__row">
          <ColorPicker value={bgColor} onChange={setBgColor} />
          <span className="sidebar__label">Цвет фона</span>
        </div>

        <div className="sidebar__preview-wrap">
          {qrSrc ? (
            <img
              key={qrSrc}
              className="sidebar__preview"
              src={qrSrc}
              alt="QR preview"
              onError={(e) => {
                e.target.src = "https://placehold.co/200x200/fafafa/09090b?text=QR"
              }}
            />
          ) : (
            <div className="sidebar__preview sidebar__preview--empty">
              <span>Нет QR</span>
            </div>
          )}
        </div>

        {qrError && <p className="sidebar__error">{qrError}</p>}

        <button
          type="button"
          className={`btn btn--primary sidebar__save${qrSaved ? " sidebar__save--saved" : ""}`}
          onClick={handleSaveQrColors}
          disabled={!alias}
        >
          {qrSaved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </aside>
    </>
  )
}

export default SettingsSidebar
