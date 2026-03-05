/**
 * Interface representing the structure of a Region
 */
export interface RegionInterface {
  articleId: string
  pageId: string
  coords?: {
    x: number
    y: number
    w: number
    h: number
  }
  isEmpty: boolean
  iiifFragment: string
}

/**
 * @class Article is an object representing a newspaper article
 * @param {String} articleId Unique identifier for the article
 */
export default class Region implements RegionInterface {
  articleId: string
  pageId: string
  coords?: {
    x: number
    y: number
    w: number
    h: number
  }
  isEmpty: boolean
  iiifFragment: string
  iiif: string

  constructor({
    articleId = '',
    pageId = '',
    coords = undefined, // [x, y, w, h]
    // g = [],
    iiifFragment = '',
    iiif = '',
    isEmpty = false
  }: {
    articleId?: string | number
    pageId?: string | number

    coords?: { x: number; y: number; w: number; h: number } | [number, number, number, number]
    // g?: Array<string | number>
    iiifFragment?: string
    iiif?: string
    isEmpty?: boolean
  } = {}) {
    this.articleId = String(articleId)
    this.pageId = String(pageId)
    if (Array.isArray(coords) && coords.length === 4) {
      this.coords = {
        x: coords[0],
        y: coords[1],
        w: coords[2],
        h: coords[3]
      }
    } else if (
      typeof coords === 'object' &&
      'x' in coords &&
      'y' in coords &&
      'w' in coords &&
      'h' in coords
    ) {
      this.coords = coords
    } else {
      this.coords = undefined
    }
    this.isEmpty = isEmpty
    // this.g = g.map(line => String(line));
    this.iiifFragment = String(iiifFragment)
    // manifest url, usually with info.json at the end
    this.iiif = String(iiif)
  }
}
