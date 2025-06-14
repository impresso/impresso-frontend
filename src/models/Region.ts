/**
 * Interface representing the structure of a Region
 */
export interface RegionInterface {
  articleUid: string
  pageUid: string
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
 * @param {String} articleUid Unique identifier for the article
 */
export default class Region implements RegionInterface {
  articleUid: string
  pageUid: string
  coords?: {
    x: number
    y: number
    w: number
    h: number
  }
  isEmpty: boolean
  iiifFragment: string

  constructor({
    articleUid = '',
    pageUid = '',
    coords = undefined, // [x, y, w, h]
    // g = [],
    iiifFragment = '',
    isEmpty = false
  } = {}) {
    this.articleUid = String(articleUid)
    this.pageUid = String(pageUid)

    if (coords) {
      this.coords = {
        x: coords[0],
        y: coords[1],
        w: coords[2],
        h: coords[3]
      }
    } else {
      this.coords = undefined
    }

    this.isEmpty = isEmpty
    // this.g = g.map(line => String(line));

    this.iiifFragment = String(iiifFragment)
  }
}
