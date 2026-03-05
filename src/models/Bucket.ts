import type { Bucket as IBucket, Entity as IEntity } from '.'
import Entity from '@/models/Entity'
import Topic from '@/models/Topic'
import Newspaper from '@/models/Newspaper'
import Year from '@/models/Year'
import Collection from '@/models/Collection'
import TextReuseCluster from '@/models/TextReuseCluster'
import Partner, { fromPartnerFacet } from '@/models/Partner'
import { FacetWithLabel } from './generated/canonical'

/**
 * @class Bucket is an object representing a Solr search engine facet bucket
 * @param {String} val The value of the dimensions, for instance a specific year,
 * language or newspaper title
 * @param {Number} count Number of matched results for this value
 * @param {Object} item Optional object of for instance type Newspaper or Entity
 */
export default class Bucket implements IBucket {
  value: string | number
  count: number
  label?: string
  item?:
    | IEntity
    | Entity
    | Topic
    | Newspaper
    | Year
    | Collection
    | TextReuseCluster
    | Partner
    | FacetWithLabel
  included?: boolean
  upper?: number
  lower?: number

  constructor({
    value = '',
    label = undefined,
    count = -1,
    item,
    included = true,
    type = '',
    upper = undefined,
    lower = undefined
  }) {
    this.value = String(value)
    this.count = count
    this.label = label
    this.included = included
    this.upper = upper
    this.lower = lower
    switch (type) {
      case 'topic':
        this.item = new Topic({ ...item, id: value, name: label })
        break
      case 'person':
      case 'location':
      case 'nag':
      case 'organisation':
        this.item = new Entity({ ...item, id: value, name: label })
        break
      case 'newspaper':
        this.item = new Newspaper({ ...item, id: value, name: label })
        break
      case 'mediaSource':
        this.item = item
        break
      case 'collection':
        this.item = new Collection({
          ...item,
          id: value,
          name: label,
          creationDate: item?.createdAt,
          lastModifiedDate: item?.updatedAt
        })
        break
      case 'year':
        this.item = new Year({ ...item, id: value, name: label })
        break
      case 'textReuseCluster':
        if (!item) {
          this.item = {
            id: this.value,
            label: String(this.label)
          } satisfies FacetWithLabel
          break
        }
        this.item = TextReuseCluster.fromTextReusePassage(item)
        break
      case 'partner':
        this.item = fromPartnerFacet(item)
        break
      case 'imageVisualContent':
      case 'imageTechnique':
      case 'imageCommunicationGoal':
      case 'imageContentType':
        this.item = {
          id: this.value,
          label: item?.label ?? String(this.value)
        } satisfies FacetWithLabel
        break
      default:
        this.item = {
          id: this.value,
          label: this.label ?? String(this.value)
        } satisfies FacetWithLabel
        break
    }

    if (!this.value.length) {
      throw new Error('Bucket should have a valid value "val", empty value given')
    }
  }
}
