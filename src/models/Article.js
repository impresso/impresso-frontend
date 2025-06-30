import Issue from './Issue'
import Newspaper from './Newspaper'
import Page from './Page'
import Region from './Region'
import ArticleTopic from './ArticleTopic'
import Tag from './Tag'
import ArticleBase from './ArticleBase'
/**
 * @class Article is an object representing a newspaper article
 * @param {String} country Country Code
 * @param {Array} collections List of Collection objects the article belongs to
 * @param {Date} date Date of the article
 * @param {String} excerpt First 20 or so words of an article
 * @param {Integer} dl number of entities (Document Length)
 * @param {Boolean} isCC wether the article regions are corrected
 * @param {Boolean} isFront appears on the frontpage
 * @param {Issue} issue Issue object of the article
 * @param {Array} labels Array of Strings with labels for the article
 * @param {String} language The language of the article
 * @param {Array} matches Array of Matches objects
 * @param {Interger} nbPages article page spread
 * @param {Newspaper} newspaper Newspaper object
 * @param {Array} pages Array of Page objects
 * @param {Array} regions Array of Region objects
 * @param {Integer} size character count
 * @param {Array} tags Array of Tag objects
 * @param {Interger} time Unix timestamp of the article
 * @param {String} title Title of the article
 * @param {String} type type of article 'ad' = advertisement, 'ar' = article, 'image' = image
 * @param {String} uid Unique identifier for the article
 * @param {Number} year Year of the article
 */
export default class Article extends ArticleBase {
  constructor({
    country = '',
    collections = [],
    date = new Date(),
    excerpt = '',
    dl = 0,
    isCC = false,
    isFront = false,
    accessRight = 'na',
    issue = new Issue(),
    labels = [],
    language = '',
    matches = [],
    nbPages = 0,
    dataProvider = '',
    newspaper = new Newspaper(),
    MediaSource = null,
    pages = [],
    regions = [],
    size = 0,
    tags = [],
    time = 0,
    title = '',
    type = '',
    uid = '',
    year = 0,
    topics = [], // array of ArticleTopic instances
    images = [],
    locations = [],
    persons = [],
    contentLineBreaks = [],
    regionBreaks = [],
    mentions = [],
    content = '',
    copyright,
    dataDomain
  } = {}) {
    super({
      uid,
      type,
      title,
      excerpt,
      isCC,
      size,
      nbPages,
      pages,
      persons,
      locations,
      collections,
      accessRight,
      // to be added dinamically from TOC
      matches,
      images,
      contentLineBreaks,
      regionBreaks,
      mentions,
      content,
      copyright,
      dataDomain
    })
    // missing data from ArticleBase
    this.country = String(country)
    this.dl = parseInt(dl, 10)
    this.isFront = Boolean(isFront)
    this.language = String(language)
    this.time = parseInt(time, 10)
    this.year = parseInt(year, 10)

    if (date instanceof Date) {
      this.date = date
    } else if (date) {
      this.date = new Date(date)
    }

    if (issue instanceof Issue) {
      this.issue = issue
    } else {
      this.issue = new Issue(issue)
    }

    this.labels = labels.map(label => String(label))

    this.dataProvider = dataProvider
    if (newspaper instanceof Newspaper) {
      this.newspaper = newspaper
    } else {
      this.newspaper = new Newspaper(newspaper)
    }
    // temporary hack
    if (!this.MediaSource && this.newspaper) {
      this.MediaSource = {
        name: this.newspaper.acronym,
        type: 'newspaper',
        id: this.newspaper.uid
      }
    }
    this.pages = pages.map(page => {
      if (page instanceof Page) {
        return page
      }
      return new Page(page)
    })

    this.regions = regions.map(region => {
      if (region instanceof Region) {
        return region
      }
      return new Region(region)
    })

    this.tags = tags.map(tag => {
      if (tag instanceof Tag) {
        return tag
      }
      return new Tag(tag)
    })

    this.topics = topics.map(topic => {
      if (topic instanceof ArticleTopic) {
        return topic
      }
      return new ArticleTopic(topic)
    })

    this.images = images
  }
}
