import { useState, useEffect } from "react"
import ColorPicker from "./ColorPicker"
import { getQRCodeSrc, saveQRColors, updateAlias, BASE_URL } from "../api"
import "./SettingsSidebar.css"

/**
 * SettingsSidebar
 * @param {"QRSettings"|null} sidebar — какой сайдбар открыт
 * @param {function} onClose
 * @param {object|null} item — текущая ссылка { alias, url, short_url, qr_fg, qr_bg, ... }
 * @param {function} onQRColorsSaved — колбэк после успешного сохранения цветов (alias, fg, bg)
 * @param {function} onAliasSaved — колбэк после успешного переименования (oldAlias, newAlias)
 */
function SettingsSidebar({ sidebar, onClose, item, onQRColorsSaved, onAliasSaved }) {
  // ── Параметры QR ───────────────────────────────────────────────────────────
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [qrSrc, setQrSrc] = useState(null)
  const [qrSaved, setQrSaved] = useState(false)
  const [qrError, setQrError] = useState("")

  // ── Параметры Alias ────────────────────────────────────────────────────────
  const [aliasValue, setAliasValue] = useState("")
  const [aliasSaving, setAliasSaving] = useState(false)
  const [aliasSaved, setAliasSaved] = useState(false)
  const [aliasError, setAliasError] = useState("")

  const alias = item?.alias || (item?.short ? item.short.split("/").pop() : null)

  // Инициализируем цвета и alias из item при его смене
  useEffect(() => {
    const fg = item?.qr_fg ? `#${item.qr_fg}` : "#000000"
    const bg = item?.qr_bg ? `#${item.qr_bg}` : "#ffffff"
    setFgColor(fg)
    setBgColor(bg)
    setQrSaved(false)
    setQrError("")
    setAliasValue(alias || "")
    setAliasSaved(false)
    setAliasError("")
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

  async function handleSaveAlias() {
    if (!alias || !aliasValue.trim()) return
    const trimmed = aliasValue.trim()
    if (trimmed === alias) {
      setAliasError("Новый alias совпадает с текущим")
      return
    }
    setAliasError("")
    setAliasSaving(true)
    try {
      await updateAlias(alias, trimmed)
      setAliasSaved(true)
      setTimeout(() => setAliasSaved(false), 2000)
      // Уведомляем родителя — он обновит список и закроет сайдбар
      onAliasSaved?.(alias, trimmed)
    } catch (err) {
      setAliasError(err.message || "Не удалось обновить alias")
    } finally {
      setAliasSaving(false)
    }
  }

  const shortUrlPreview = aliasValue.trim()
    ? `${BASE_URL}/${aliasValue.trim()}`
    : ""

  return (
    <>
      {sidebar && <div className="overlay" onClick={onClose} />}

      {/* ── Параметры QR-кода ── */}
      <aside className={`sidebar ${sidebar === "QRSettings" ? "open" : ""}`}>
        <div className="sidebar__header">
          <h2 className="sidebar__title">Параметры ссылки</h2>
          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* ── Секция alias ── */}
        <div className="sidebar__section">
          <h3 className="sidebar__section-title">Alias ссылки</h3>
          <div className="sidebar__alias-row">
            <span className="sidebar__alias-base">{BASE_URL}/</span>
            <input
              type="text"
              className="sidebar__alias-input"
              value={aliasValue}
              onChange={(e) => {
                setAliasValue(e.target.value)
                setAliasError("")
                setAliasSaved(false)
              }}
              placeholder="мой-alias"
              maxLength={64}
              disabled={!alias}
            />
          </div>
          {shortUrlPreview && aliasValue.trim() !== alias && (
            <div className="sidebar__alias-preview">
              → <span>{shortUrlPreview}</span>
            </div>
          )}
          {aliasError && <p className="sidebar__error">{aliasError}</p>}
          <button
            type="button"
            className={`btn btn--primary sidebar__save${aliasSaved ? " sidebar__save--saved" : ""}`}
            onClick={handleSaveAlias}
            disabled={!alias || aliasSaving || !aliasValue.trim() || aliasValue.trim() === alias}
          >
            {aliasSaving ? "Сохраняем..." : aliasSaved ? "Сохранено ✓" : "Сохранить alias"}
          </button>
        </div>

        <div className="sidebar__divider" />

        {/* ── Секция QR ── */}
        <div className="sidebar__section">
          <h3 className="sidebar__section-title">Цвета QR-кода</h3>

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
            {qrSaved ? "Сохранено ✓" : "Сохранить цвета"}
          </button>
        </div>
      </aside>
    </>
  )
}

export default SettingsSidebar
