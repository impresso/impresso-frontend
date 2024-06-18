export function getArticleParameters(articleId, pageNumber) {
  const parts = articleId.split('-')
  const issueId = parts.slice(0, parts.length - 1).join('-')
  const pageId = [issueId, `p${String(pageNumber).padStart(4, 0)}`].join('-')

  return {
    issue_uid: issueId,
    page_uid: pageId,
    article_uid: articleId
  }
}

/**
 * @param {string} issueId issue UID
 * @param {number} pageIndex 0-based page index
 */
export function getPageId(issueId, pageIndex) {
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
