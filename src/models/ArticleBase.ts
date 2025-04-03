import Collection from './Collection'
import Entity from './Entity'
import Match from './Match'

interface Page {
  num: number
  // Add other page properties as needed
}

interface ArticleBaseConstructorParams {
  uid?: string
  type?: string
  title?: string
  excerpt?: string
  isCC?: boolean
  size?: number
  nbPages?: number
  pages?: Page[]
  persons?: Entity[] | any[]
  locations?: Entity[] | any[]
  collections?: Collection[] | any[]
  accessRight?: string
  matches?: Match[] | any[]
  images?: any[]
  contentLineBreaks?: any[]
  regionBreaks?: any[]
  mentions?: any[]
  content?: string
}

/**
 * ArticleBase is an object representing a newspaper article in
 * issue Table of contents. that 's why it is simplified.
 */
export default class ArticleBase {
  uid: string
  type: string
  title: string
  excerpt: string
  isCC: boolean
  size: number
  nbPages: number
  pages: Page[]
  accessRight: string
  images: any[]
  contentLineBreaks: any[]
  regionBreaks: any[]
  mentions: any[]
  content: string
  collections: Collection[]
  matches: Match[]
  locations: Entity[]
  persons: Entity[]

  constructor({
    uid = '',
    type = '',
    title = '',
    excerpt = '',
    isCC = false,
    size = 0,
    nbPages = 0,
    pages = [],
    persons = [],
    locations = [],
    collections = [],
    accessRight = 'na',
    // to be added dinamically from TOC
    matches = [],
    images = [],
    contentLineBreaks = [],
    regionBreaks = [],
    mentions = [],
    content = ''
  }: ArticleBaseConstructorParams = {}) {
    this.uid = String(uid)
    this.type = String(type)
    this.title = String(title)
    this.excerpt = String(excerpt)
    this.isCC = Boolean(isCC)
    this.size = typeof size === 'string' ? parseInt(size, 10) : size
    this.nbPages = typeof nbPages === 'string' ? parseInt(nbPages, 10) : nbPages
    this.pages = pages
    this.accessRight = accessRight
    this.images = images
    this.contentLineBreaks = contentLineBreaks
    this.regionBreaks = regionBreaks
    this.mentions = mentions
    this.content = content

    this.collections = collections.map(collection => {
      if (collection instanceof Collection) {
        return collection
      }
      return new Collection(collection)
    })

    this.matches = matches.map(match => {
      if (match instanceof Match) {
        return match
      }
      return new Match(match)
    })

    this.locations = locations.map(location => {
      if (location instanceof Entity) {
        return location
      }
      return new Entity(location)
    })

    this.persons = persons.map(person => {
      if (person instanceof Entity) {
        return person
      }
      return new Entity(person)
    })

    // no title?
    if (!this.title.length && this.excerpt.length) {
      const parts = this.excerpt.split(/\s/)
      this.title = parts.slice(0, 4).join(' ')
      this.excerpt = parts.slice(4).join(' ')
    }
  }

  setImages(images: any[]): void {
    this.images = images
  }
}
