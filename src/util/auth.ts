export const getAuthHeaders = (token: string | undefined) => {
  return token != null
    ? {
        Authorization: `Bearer ${token}`
      }
    : {}
}

/**
 * Decodes a JSON Web Token (JWT) and returns its payload as a parsed object.
 *
 * This function extracts the payload portion of a JWT token, performs base64url
 * decoding, and parses the resulting JSON string into a JavaScript object.
 *
 * @param token - The JWT token string to decode
 * @returns The decoded JWT payload as a JavaScript object
 *
 * @example
 * ```typescript
 * const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
 * const payload = decodeJwt(token);
 * console.log(payload.sub); // "1234567890"
 * ```
 *
 * @throws Will throw an error if the token format is invalid or if JSON parsing fails
 *
 * @remarks
 * - This function only decodes the token and does not verify its signature
 * - The function assumes the token follows the standard JWT format (header.payload.signature)
 * - Base64url encoding characters (-,_) are converted to standard base64 characters (+,/)
 */
export function decodeJwt(token: string) {
  const payload = token.split('.')[1]
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(decodeURIComponent(decoded))
}
