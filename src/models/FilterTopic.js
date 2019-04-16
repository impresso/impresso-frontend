/**
 * FilterTopic object
 * @param {String} query The search query
 */
import Topic from '@/models/Topic';
import Filter from '@/models/FilterBase';

export default class FilterTopic extends Filter {
  constructor(args) {
    super(args);
    this.h = String(args.h);
    this.q = String(args.q);
    this.query = this.q;
    this.precision = String(args.precision);
    this.item = new Topic(args.item);
  }

  getQuery() {
    return {
      type: this.type,
      q: this.query,
      context: this.context,
    };
  }
}
