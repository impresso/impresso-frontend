/**
 * Sets a cookie with the provided name and value
 * @param name The name of the cookie
 * @param value The value to store in the cookie
 * @param options Additional cookie options
 */
export interface CookieOptions {
  /** The path for the cookie. Defaults to '/' */
  path?: string
  /** Whether the cookie should only be sent over HTTPS */
  secure?: boolean
  /** Whether the cookie is accessible only through HTTP(S) requests and not JavaScript */
  httpOnly?: boolean
  /** Expiration date as a Date object or number of days until expiration */
  expires?: Date | number
  /** Domain for the cookie */
  domain?: string
  /** Same-site attribute for the cookie (None, Lax, or Strict) */
  sameSite?: 'None' | 'Lax' | 'Strict'
}

/**
 * Sets a cookie with the specified name and value
 * @param name The name of the cookie
 * @param value The value to store in the cookie
 * @param options Optional configuration for the cookie
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const { path = '/', secure = false, httpOnly = false, expires, domain, sameSite } = options

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  // Add path
  cookieString += `; path=${path}`

  // Add expiration if provided
  if (expires) {
    const expirationDate =
      expires instanceof Date ? expires : new Date(Date.now() + expires * 24 * 60 * 60 * 1000)
    cookieString += `; expires=${expirationDate.toUTCString()}`
  }

  // Add domain if provided
  if (domain) {
    cookieString += `; domain=${domain}`
  }

  // Add same-site if provided
  if (sameSite) {
    cookieString += `; samesite=${sameSite.toLowerCase()}`
  }

  // Add secure flag if true
  if (secure) {
    cookieString += '; secure'
  }

  // Add httpOnly flag if true
  if (httpOnly) {
    cookieString += '; httponly'
  }

  console.log('[cookies:setCookie] Setting cookie:', cookieString)
  // Set the cookie
  document.cookie = cookieString
}

/**
 * Gets a cookie value by name
 * @param name The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';')
  const encodedName = encodeURIComponent(name)

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=')
    if (cookieName === encodedName) {
      return decodeURIComponent(cookieValue)
    }
  }

  return null
}

/**
 * Removes a cookie by name
 * @param name The name of the cookie to remove
 * @param path The path of the cookie (must match the path used when setting)
 */
export function removeCookie(name: string, path = '/'): void {
  // Set expiration to a past date to remove the cookie
  setCookie(name, '', {
    path,
    expires: new Date(0)
  })
}
