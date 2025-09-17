/**
 * FilterTopic object
 * @param {String} query The search query
 */
import Topic from '@/models/Topic'
import FilterItems from '@/models/FilterItems'

export default class FilterTopic extends FilterItems {
  h: string

  constructor(args) {
    super(args)
    this.h = String(args.h)
    if (!this.items.length && Array.isArray(this.q)) {
      this.items = this.q.map(
        uid =>
          new Topic({
            uid
          })
      )
    }
    this.items = this.items.map(item => (item instanceof Topic ? item : new Topic(item)))
  }

  setItems(items = []) {
    this.items = items.map(d => {
      const t = new Topic(d)
      t.checked = true
      return t
    })
  }

  getQuery() {
    return {
      type: this.type,
      q: this.q,
      op: this.op,
      context: this.context
    }
  }
}
