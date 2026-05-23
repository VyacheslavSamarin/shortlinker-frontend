import { useState, useEffect, useRef } from "react"
import { updateAlias, BASE_URL } from "../api"
import "./AliasModal.css"

/**
 * AliasModal — модальное окно для редактирования alias ссылки
 * @param {object|null} item — ссылка { alias, short_url, ... }
 * @param {function} onClose — закрыть модал
 * @param {function} onSaved — колбэк (oldAlias, newAlias) после успешного сохранения
 */
function AliasModal({ item, onClose, onSaved }) {
  const alias = item?.alias || null
  const [value, setValue] = useState(alias || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    setValue(alias || "")
    setError("")
    setSaved(false)
  }, [alias])

  // Фокус на поле при открытии
  useEffect(() => {
    if (item) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [item])

  if (!item) return null

  const trimmed = value.trim()
  const preview = trimmed ? `${BASE_URL}/${trimmed}` : ""
  const unchanged = trimmed === alias

  async function handleSave() {
    if (!alias || !trimmed || unchanged) return
    setError("")
    setSaving(true)
    try {
      await updateAlias(alias, trimmed)
      setSaved(true)
      setTimeout(() => {
        onSaved?.(alias, trimmed)
        onClose()
      }, 800)
    } catch (err) {
      setError(err.message || "Не удалось обновить alias")
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") onClose()
  }

  return (
    <div className="alias-modal-overlay" onClick={onClose}>
      <div
        className="alias-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="alias-modal-title"
        aria-modal="true"
      >
        <div className="alias-modal__header">
          <h2 id="alias-modal-title" className="alias-modal__title">
            Изменить alias
          </h2>
          <button
            type="button"
            className="alias-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="alias-modal__body">
          <label className="alias-modal__label" htmlFor="alias-input">
            Короткий адрес
          </label>
          <div className="alias-modal__input-row">
            <span className="alias-modal__base">{BASE_URL}/</span>
            <input
              id="alias-input"
              ref={inputRef}
              type="text"
              className="alias-modal__input"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError("")
                setSaved(false)
              }}
              onKeyDown={handleKeyDown}
              placeholder="мой-alias"
              maxLength={64}
            />
          </div>

          {preview && !unchanged && (
            <div className="alias-modal__preview">
              Новая ссылка: <span>{preview}</span>
            </div>
          )}

          {error && <p className="alias-modal__error">{error}</p>}
        </div>

        <div className="alias-modal__footer">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="button"
            className={`btn btn--primary${saved ? " alias-modal__btn--saved" : ""}`}
            onClick={handleSave}
            disabled={saving || !trimmed || unchanged || saved}
          >
            {saving ? "Сохраняем..." : saved ? "Сохранено ✓" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AliasModal
