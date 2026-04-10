import FilterItems from '@/models/FilterItems'
import Entity from '@/models/Entity'

export default class FilterEntity extends FilterItems {
  setItems(items = []) {
    this.items = items.map(id => {
      const item = typeof id === 'object' ? new Entity(id) : new Entity({ id })
      item.checked = true
      return item
    })
  }
}
