import Issue from './Issue'
import Newspaper from './Newspaper'
import Page, { IPage } from './Page'
import Region from './Region'
import ArticleTopic from './ArticleTopic'
import Tag from './Tag'
import ArticleBase, { ArticleBaseInterface } from './ArticleBase'
import { ContentItem } from './generated/schemas/contentItem'

/**
 * @deprecated use `ContentItem` instead.
 * @interface ArticleInterface is an object representing a newspaper article
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
 * @param {Array} regions Array of Region objects
 * @param {Integer} size character count
 * @param {Array} tags Array of Tag objects
 * @param {Interger} time Unix timestamp of the article
 * @param {String} title Title of the article
 * @param {String} type type of article 'ad' = advertisement, 'ar' = article, 'image' = image
 * @param {String} uid Unique identifier for the article
 * @param {Number} year Year of the article
 */
export interface ArticleInterface extends ArticleBaseInterface {
  country: string
  dl: number
  isFront: boolean
  language: string
  time: number
  year: number
  date: Date
  issue: Issue
  labels: string[]
  dataProvider: string
  newspaper: Newspaper
  MediaSource: { name: string; type: string; id: string } | null
  regions: Region[]
  tags: Tag[]
  topics: ArticleTopic[]
  images: any[]
}

/**
 * @deprecated use `ContentItem` instead.
 */
export interface ArticleConstructorParams {
  country?: string
  collections?: any[]
  date?: Date | string | number
  excerpt?: string
  dl?: number
  isCC?: boolean
  isFront?: boolean
  accessRight?: string
  issue?: Issue | any
  labels?: string[]
  language?: string
  matches?: any[]
  nbPages?: number
  dataProvider?: string
  newspaper?: Newspaper | any
  MediaSource?: { name: string; type: string; id: string } | null
  pages?: IPage[] | any[]
  regions?: Region[] | any[]
  size?: number
  tags?: Tag[] | any[]
  time?: number
  title?: string
  type?: string
  uid?: string
  year?: number
  topics?: ArticleTopic[] | any[]
  images?: any[]
  locations?: any[]
  persons?: any[]
  contentLineBreaks?: any[]
  regionBreaks?: any[]
  mentions?: any[]
  content?: string
}

/**
 * @deprecated use `ContentItem` instead.
 */
export default class Article extends ArticleBase implements ArticleInterface {
  country: string
  dl: number
  isFront: boolean
  language: string
  time: number
  year: number
  date: Date
  issue: Issue
  labels: string[]
  dataProvider: string
  newspaper: Newspaper
  MediaSource: { name: string; type: string; id: string } | null
  regions: Region[]
  tags: Tag[]
  topics: ArticleTopic[]

  /**
   * Convert a new `ContentItem` model to an `Article` model.
   * All new and refactored code must use `ContentItem`.
   *
   * @param contentItem ContentItem from the API
   * @returns Article instance
   */
  static fromContentItem(contentItem: ContentItem): Article {
    const { id, issueId, meta, text, semanticEnrichments, image, access } = contentItem

    // Create a newspaper instance from meta data
    const newspaper = new Newspaper({
      uid: meta?.mediaId ?? '',
      name: meta?.mediaId ?? '',
      acronym: meta?.mediaId ?? ''
    })

    // Create an issue instance
    const issue = new Issue({
      uid: issueId ?? '',
      newspaper: newspaper,
      date: meta?.date ? new Date(meta.date) : new Date()
    })

    // Map topics if they exist
    const topics =
      semanticEnrichments?.topics?.map(
        topic =>
          new ArticleTopic({
            articleUid: topic.id,
            relevance: topic.relevance
          })
      ) ?? []

    // Map collections to tags
    const tags =
      semanticEnrichments?.collections?.map(
        collection =>
          new Tag({
            uid: collection.uid,
            name: collection.name
          })
      ) ?? []

    // Map pages
    const pages =
      image?.pages?.map(
        (page, idx) =>
          new Page({
            uid: page.id ?? `page-${idx}`,
            num: page.number ?? idx + 1,
            iiif: page.iiif?.manifestUrl ?? '',
            iiifThumbnail: page.iiif?.thumnbnailUrl ?? ''
          })
      ) ?? []

    // Create regions from coordinates if available
    const regions = []
    if (image?.pages) {
      image.pages.forEach((page, pageIdx) => {
        if (page.regionCoordinates) {
          page.regionCoordinates.forEach(coords => {
            regions.push(
              new Region({
                articleUid: contentItem.id,
                pageUid: page.id ?? `page-${pageIdx}`,
                coords: coords
              })
            )
          })
        }
      })
    }

    // Map named entities
    const persons =
      semanticEnrichments?.namedEntities?.persons?.map(person => ({
        id: person.id,
        name: person.label,
        count: person.count
      })) ?? []

    const locations =
      semanticEnrichments?.namedEntities?.locations?.map(location => ({
        id: location.id,
        name: location.label,
        count: location.count
      })) ?? []

    // Extract line breaks
    const contentLineBreaks = image?.lineBreaks ?? []
    const regionBreaks = image?.regionBreaks ?? []

    // Extract mentions for highlighting
    const mentions = []
    if (semanticEnrichments?.mentions) {
      Object.entries(semanticEnrichments.mentions).forEach(([type, typeItems]) => {
        typeItems?.forEach(item => {
          if (item.startOffset !== undefined && item.endOffset !== undefined) {
            mentions.push({
              type,
              surface: item.surfaceForm,
              offsets: [item.startOffset, item.endOffset],
              confidence: item.mentionConfidence
            })
          }
        })
      })
    }

    // Create article parameters
    const articleParams: ArticleConstructorParams = {
      uid: id,
      title: text?.title ?? '',
      excerpt: text?.snippet ?? '',
      content: text?.content ?? '',
      language: text?.langCode ?? '',
      country: meta?.countryCode ?? '',
      date: meta?.date ? new Date(meta.date) : new Date(),
      year: meta?.date ? new Date(meta.date).getFullYear() : 0,
      time: meta?.date ? new Date(meta.date).getTime() : 0,
      size: text?.contentLength ?? 0,
      type: text?.itemType ?? '',
      isCC: image?.isCoordinatesConverted ?? false,
      isFront: image?.isFrontPage ?? false,
      nbPages: image?.pagesCount ?? 0,
      dl: semanticEnrichments?.namedEntities
        ? Object.values(semanticEnrichments.namedEntities).flat().filter(Boolean).length
        : 0,
      accessRight: access?.dataDomain ?? 'na',
      dataProvider: meta?.partnerId ?? '',
      newspaper,
      issue,
      topics,
      tags,
      pages,
      regions,
      persons,
      locations,
      contentLineBreaks,
      regionBreaks,
      mentions,
      MediaSource: {
        name: meta?.mediaId ?? '',
        type: meta?.sourceType ?? 'newspaper',
        id: meta?.mediaId ?? ''
      },
      collections:
        semanticEnrichments?.collections?.map(c => ({
          uid: c.uid,
          name: c.name
        })) ?? [],
      matches:
        text?.matches?.map(match => ({
          fragment: match.fragment,
          coords: match.coords,
          pageUid: match.pageUid,
          iiif: match.iiif
        })) ?? [],
      images: []
    }

    return new Article(articleParams)
  }

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
    content = ''
  }: ArticleConstructorParams = {}) {
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
      content
    })
    // missing data from ArticleBase
    this.country = String(country)
    this.dl = typeof dl === 'string' ? parseInt(dl, 10) : dl
    this.isFront = Boolean(isFront)
    this.language = String(language)
    this.time = typeof time === 'string' ? parseInt(time, 10) : time
    this.year = typeof year === 'string' ? parseInt(year, 10) : year

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
