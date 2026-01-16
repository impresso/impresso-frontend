import { WebAppBaseUrl, WebAppHost } from '@/constants'

/**
 *
 * @param articleId
 * @param pageNumber
 * @returns
 */
export function getArticleParameters(articleId: string, pageNumber: number) {
  const parts = articleId.split('-')
  const issueId = parts.slice(0, parts.length - 1).join('-')
  const pageId = [issueId, `p${String(pageNumber).padStart(4, '0')}`].join('-')

  return {
    issue_uid: issueId,
    page_uid: pageId,
    article_uid: articleId
  }
}

/**
 *
 * @param {string} issueId issue UID
 * @param {number} pageIndex 0-based page index
 */
export function getPageId(issueId: string, pageIndex: number) {
  const pageNumber = pageIndex + 1
  return `${issueId}-p${String(pageNumber).padStart(4, '0')}`
}

/**
 * @param {string} longArticleId
 */
export function getShortArticleId(longArticleId) {
  return longArticleId.split('-').slice(-1)[0]
}

export function getLongArticleId(issueId, shortArticleId) {
  return `${issueId}-${shortArticleId}`
}
/**
 * Given a content item ID, returns its permalink URL
 * @param contentItemId Content item ID
 * @returns
 */
export function getContentItemPermalink(contentItemId: string) {
  return `${WebAppHost}${WebAppBaseUrl}content-item/${contentItemId}`
}
