import { useRef } from "react"
import "./ColorPicker.css"

/**
 * Управляемый ColorPicker
 * @param {string} value  — текущий hex-цвет, например "#000000"
 * @param {function} onChange — колбэк (newHexColor: string) => void
 */
function ColorPicker({ value = "#000000", onChange }) {
  const inputRef = useRef(null)

  function openPicker() {
    inputRef.current.click()
  }

  return (
    <div className="color-picker">
      <button
        type="button"
        className="color-picker__swatch"
        style={{ background: value }}
        onClick={openPicker}
        aria-label="Выбрать цвет"
      />
      <input
        ref={inputRef}
        type="color"
        className="color-picker__input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}

export default ColorPicker
