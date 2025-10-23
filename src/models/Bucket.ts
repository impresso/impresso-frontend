import type { Bucket as IBucket, Entity as IEntity } from '.'
import Entity from '@/models/Entity'
import Topic from '@/models/Topic'
import Newspaper from '@/models/Newspaper'
import Year from '@/models/Year'
import Collection from '@/models/Collection'
import TextReuseCluster from '@/models/TextReuseCluster'
import Partner, { fromPartnerFacet } from '@/models/Partner'

/**
 * @class Bucket is an object representing a Solr search engine facet bucket
 * @param {String} val The value of the dimensions, for instance a specific year,
 * language or newspaper title
 * @param {Number} count Number of matched results for this value
 * @param {Object} item Optional object of for instance type Newspaper or Entity
 */
export default class Bucket implements IBucket {
  val: string | number
  count: number
  item?: IEntity | Entity | Topic | Newspaper | Year | Collection | TextReuseCluster | Partner
  included?: boolean
  upper?: number
  lower?: number

  constructor({
    val = '',
    count = -1,
    item,
    included = true,
    type = '',
    upper = undefined,
    lower = undefined
  }) {
    this.val = String(val)
    this.count = count
    this.included = included
    this.upper = upper
    this.lower = lower
    switch (type) {
      case 'topic':
        this.item = new Topic(item)
        break
      case 'person':
      case 'location':
      case 'nag':
      case 'organisation':
        this.item = new Entity(item)
        break
      case 'newspaper':
        this.item = new Newspaper(item)
        break
      case 'mediaSource':
        this.item = item
        break
      case 'collection':
        this.item = new Collection({
          ...item,
          creationDate: item?.createdAt,
          lastModifiedDate: item?.updatedAt,
          name: item.title
        })
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
        } satisfies IEntity
        break
    }

    if (!this.val.length) {
      throw new Error('Bucket should have a valid value "val", empty value given')
    }
  }
}
