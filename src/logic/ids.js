
// eslint-disable-next-line import/prefer-default-export
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
