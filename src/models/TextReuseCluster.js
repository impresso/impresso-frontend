/**
 * @class TextReuseCluster is an object representing a Text Reuse cluster
 *
 * @param {String} id Unique identifier for the cluster
 * @param
 *
 *
 * @param {String} acronym Three Letter Acronym (TLA) for the newspaper
 * @param {Integer} countArticles Amount of articles in the issue
 * @param {Integer} countPages Amount of pages in the issue
 * @param {Integer} deltaYear total running time of the newspaper
 * @param {Integer} endYear year of last issue
 * @param {String} name Full name if the newspaper
 * @param {Integer} startYear year of first issue
 * @param {String} uid Unique identifier for the newspaper
 */
export default class TextReuseCluster {
  constructor({
    id = '',
    textSampleArticle = {},
    textSampleTitle = '',
    textSampleContent = '',
    textSampleExcerpt = '',
    textSampleDate = '',
    timeDifferenceDay = 0,
    maxDate = new Date(),
    minDate = new Date(),
    clusterSize = 0,
    lexicalOverlap = 0,
    connectedClusters = [],
  } = {}) {
    this.id = String(id)
    this.shortId = this.id.split('-').pop()

    this.textSampleArticle = textSampleArticle
    this.textSampleTitle = String(textSampleTitle)
    this.textSampleContent = String(textSampleContent)
    this.textSampleExcerpt = String(textSampleExcerpt)
    this.textSampleDate = String(textSampleDate)
    this.timeDifferenceDay = parseInt(timeDifferenceDay, 10)
    this.maxDate = maxDate
    this.minDate = minDate
    this.clusterSize = parseInt(clusterSize, 10)
    this.connectedClusters = connectedClusters
    this.lexicalOverlap = parseFloat(lexicalOverlap)
  }

  static fromSolrResponse(response) {
    return response.map(cluster => {
      return new TextReuseCluster({
        id: cluster.id,
      })
    })
  }
  /**
   *
   * @param {*} item
   * @returns TextReuseCluster object
   */
  static fromTextReusePassage(item) {
    if (!item.textReuseCluster) return undefined

    const maxDate = new Date(item.date)
    const minDate = new Date(
      +maxDate - item.textReuseCluster.timeDifferenceDay * 24 * 60 * 60 * 1000,
    )
    return new TextReuseCluster({
      id: item.textReuseCluster.id,
      textSampleTitle: item.title,
      textSampleContent: item.content,
      textSampleExcerpt:
        item.content.length > 200 ? `${item.content.substring(0, 200)}...` : item.content,
      textSampleArticle: item.article,
      textSampleDate: item.date,
      timeDifferenceDay: item.textReuseCluster.timeDifferenceDay,
      maxDate,
      minDate,
      clusterSize: item.textReuseCluster.clusterSize,
      lexicalOverlap: item.textReuseCluster.lexicalOverlap,
      connectedClusters: item.connectedClusters,
    })
  }
}
