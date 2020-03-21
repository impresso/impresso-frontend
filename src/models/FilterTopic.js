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
    if (!this.items.length) {
      this.items = this.q.map(uid => new Topic({
        uid,
      }));
    } else {
      this.items = this.items.map(item => new Topic(item))
    }
  }

  setItems(items = []) {
    this.items = items.map(d => new Topic(d));
    items.forEach((d, i) => {
      this.items[i].checked = true;
    });
  }

  getQuery() {
    return {
      type: this.type,
      q: this.q,
      op: this.op,
      context: this.context,
    };
  }
}
