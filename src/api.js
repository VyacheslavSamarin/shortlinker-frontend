const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8082"

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token")
}

function setToken(token) {
  localStorage.setItem("token", token)
}

function removeToken() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"))
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function register(email, password) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  return data
}

/**
 * Отправить код подтверждения на email (шаг 1 регистрации)
 */
async function sendVerificationCode(email, password) {
  const data = await request("/auth/register/send-code", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  return data
}

/**
 * Подтвердить email кодом и завершить регистрацию (шаг 2)
 * Автоматически сохраняет токен и данные пользователя
 */
async function verifyAndRegister(email, code) {
  const data = await request("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  })
  setToken(data.token)
  setUser({ id: data.user_id, email: data.email })
  return data
}

async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  setUser({ id: data.id, email: data.email })
  return data
}

async function logoutApi() {
  const token = getToken()
  if (token) {
    try {
      await request("/auth/logout", { method: "POST" })
    } catch {
      // Игнорируем ошибки — всё равно чистим локальное состояние
    }
  }
  removeToken()
}

function logout() {
  removeToken()
}

function isAuthenticated() {
  return !!getToken()
}

// ─── URLs ─────────────────────────────────────────────────────────────────────

/**
 * Сократить ссылку (работает и без авторизации, и с ней)
 * @param {string} url
 * @param {string} [alias]
 */
async function shortenUrl(url, alias = "") {
  const body = { url }
  if (alias) body.alias = alias

  const data = await request("/url", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return data // { status, alias, short_url }
}

/**
 * Получить список ссылок текущего пользователя
 */
async function getUserUrls() {
  const data = await request("/user/urls")
  return data.urls || []
}

/**
 * Удалить ссылку по alias
 */
async function deleteUrl(alias) {
  await request(`/url/${alias}`, { method: "DELETE" })
}

// ─── QR ───────────────────────────────────────────────────────────────────────

/**
 * Получить URL для QR-кода (возвращает blob URL)
 */
async function getQRCodeUrl(alias) {
  const token = getToken()
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const res = await fetch(`${BASE_URL}/${alias}/qr`, { headers })
  if (!res.ok) throw new Error("Failed to load QR code")

  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

/**
 * Получить прямой URL для QR-кода (для тега <img>)
 * @param {string} alias
 * @param {object} [params] — { fg?: string, bg?: string } — hex-цвета без #
 */
function getQRCodeSrc(alias, params = {}) {
  const url = new URL(`${BASE_URL}/${alias}/qr`)
  if (params.fg) url.searchParams.set("fg", params.fg.replace("#", ""))
  if (params.bg) url.searchParams.set("bg", params.bg.replace("#", ""))
  return url.toString()
}

/**
 * Сохранить цвета QR-кода на сервере
 * @param {string} alias
 * @param {string} fg — hex без #, например "000000"
 * @param {string} bg — hex без #, например "ffffff"
 */
async function saveQRColors(alias, fg, bg) {
  await request(`/${alias}/qr/colors`, {
    method: "PUT",
    body: JSON.stringify({
      fg: fg.replace("#", ""),
      bg: bg.replace("#", ""),
    }),
  })
}

/**
 * Обновить alias ссылки
 * @param {string} oldAlias — текущий alias
 * @param {string} newAlias — новый alias
 * @returns {{ alias: string }} — объект с новым alias
 */
async function updateAlias(oldAlias, newAlias) {
  const data = await request(`/${oldAlias}/alias`, {
    method: "PUT",
    body: JSON.stringify({ new_alias: newAlias }),
  })
  return data // { status, alias }
}

// ─── Статистика ───────────────────────────────────────────────────────────────

/**
 * Получить статистику переходов по alias
 */
async function getStats(alias) {
  const data = await request(`/stats/${alias}`)
  return data.visits || []
}

// ─── Пользователь ─────────────────────────────────────────────────────────────

async function getMe() {
  const data = await request("/user/me")
  return data.user
}

export {
  BASE_URL,
  getToken,
  getUser,
  isAuthenticated,
  register,
  sendVerificationCode,
  verifyAndRegister,
  login,
  logout,
  logoutApi,
  shortenUrl,
  getUserUrls,
  deleteUrl,
  getQRCodeUrl,
  getQRCodeSrc,
  saveQRColors,
  updateAlias,
  getStats,
  getMe,
}
