const sameOrigin = (imageUrl: string) => imageUrl.startsWith(import.meta.env.VITE_BASE_URL)
const relativeUrl = (imageUrl: string) => imageUrl.startsWith('/')

export const defaultAuthCondition = (imageUrl: string) =>
  sameOrigin(imageUrl) || relativeUrl(imageUrl)
