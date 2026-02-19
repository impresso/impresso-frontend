const sameOrigin = (imageUrl: string) => imageUrl.startsWith(import.meta.env.BASE_URL)
const relativeUrl = (imageUrl: string) => imageUrl.startsWith('/')

export const defaultAuthCondition = (imageUrl: string) =>
  sameOrigin(imageUrl) || relativeUrl(imageUrl)

export const defaultAuthDomains = ['dev.impresso-project.ch', 'impresso-project.ch']

export const requiresCredentials = (url: string, domains: string[] = defaultAuthDomains) => {
  // if url is relative, it is same origin
  if (relativeUrl(url)) {
    return true
  }

  try {
    const urlObj = new URL(url)
    return domains.includes(urlObj.hostname)
  } catch (e) {
    return false
  }
}
