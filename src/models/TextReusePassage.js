export default class TextReusePassage {
  constructor({
    id = '',
    title = '',
    content = '',
    article = {},
    date = new Date(),
    newspaper = {},
    issue = {},
    pageNumbers = [],
    textReuseCluster = {},
    connectedClusters = [],
  } = {}) {
    this.id = String(id)
    this.title = String(title)
    this.content = String(content)
    this.article = article
    this.newspaper = newspaper
    this.issue = issue
    this.date = date instanceof Date ? date : new Date(date)
    this.textReuseCluster = textReuseCluster
    this.connectedClusters = connectedClusters
    this.pageNumbers = pageNumbers
  }

  static fromSolrResponse(response) {
    return response.map(item => {
      return new TextReusePassage({
        id: item.id,
        title: item.title,
        content: item.content,
        article: item.article,
        date: new Date(item.date),
        textReuseCluster: item.textReuseCluster,
      })
    })
  }
}
