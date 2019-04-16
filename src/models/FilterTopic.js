/**
 * FilterTopic object
 * @param {String} query The search query
 */
import Topic from '@/models/Topic';
import FilterItems from '@/models/FilterItems';

export default class FilterTopic extends FilterItems {
  constructor(args) {
    super(args);
    this.h = String(args.h);
    this.range = [0, 1];
    if (!this.items.length) {
      this.items = this.q.map(uid => new Topic({
        uid,
      }));
    }
  }

  setItems(items = []) {
    this.items = items.map(d => new Topic(d));
  }

  getQuery() {
    return {
      type: this.type,
      q: this.q,
      r: this.range,
      context: this.context,
    };
  }
}
