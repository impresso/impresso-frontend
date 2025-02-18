export const getAuthHeaders = (token: string | undefined) => {
  return token != null
    ? {
        Authorization: `Bearer ${token}`
      }
    : {}
}
