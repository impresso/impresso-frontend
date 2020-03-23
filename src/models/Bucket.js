import Entity from '@/models/Entity';
import Topic from '@/models/Topic';
import Newspaper from '@/models/Newspaper';
import Year from '@/models/Year';
import Collection from '@/models/Collection';

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
  } = {}) {
    this.val = String(val);
    this.count = parseInt(count, 10);
    this.included = included;

    switch (type) {
    case 'topic':
      this.item = new Topic(item);
      break;
    case 'person':
    case 'location':
      this.item = new Entity(item);
      break;
    case 'newspaper':
      this.item = new Newspaper(item);
      break;
    case 'collection':
      this.item = new Collection(item);
      break;
    case 'year':
      this.item = new Year(item);
      break;
    default:
      this.item = {
        uid: this.val,
      };
      break;
    }

    if (!this.val.length) {
      throw new Error('Bucket should have a valid value "val", empty value given');
    }
  }
}
