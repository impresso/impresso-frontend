import Entity from '@/models/Entity'
import Topic from '@/models/Topic'
import Newspaper from '@/models/Newspaper'
import Year from '@/models/Year'
import Collection from '@/models/Collection'
import TextReuseCluster from '@/models/TextReuseCluster'
import { fromPartnerFacet } from '@/models/Partner'

/**
 * @class Bucket is an object representing a Solr search engine facet bucket
 * @param {String} val The value of the dimensions, for instance a specific year,
 * language or newspaper title
 * @param {Number} count Number of matched results for this value
 * @param {Object} item Optional object of for instance type Newspaper or Entity
 */
export default class Bucket {
  constructor({
    val = '',
    count = -1,
    item = {},
    included = true,
    type = '',
    upper = undefined,
    lower = undefined
  } = {}) {
    this.val = String(val)
    this.count = parseInt(count, 10)
    this.included = included
    this.upper = upper
    this.lower = lower
    switch (type) {
      case 'topic':
        this.item = new Topic(item)
        break
      case 'person':
      case 'location':
        this.item = new Entity(item)
        break
      case 'newspaper':
        this.item = new Newspaper(item)
        break
      case 'collection':
        this.item = new Collection(item)
        break
      case 'year':
        this.item = new Year(item)
        break
      case 'textReuseCluster':
        this.item = TextReuseCluster.fromTextReusePassage(item)
        break
      case 'partner':
        this.item = fromPartnerFacet(item)
        break
      default:
        this.item = {
          uid: this.val
        }
        break
    }

    if (!this.val.length) {
      throw new Error('Bucket should have a valid value "val", empty value given')
    }
  }
}
