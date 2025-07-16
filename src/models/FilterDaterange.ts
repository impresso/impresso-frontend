import FilterItems from '@/models/FilterItems'
import Daterange from '@/models/Daterange'

export default class FilterDaterange extends FilterItems {
  setItems(items = []) {
    this.items = items.map(daterange => {
      const item = new Daterange({ daterange })
      item.uid = item.getValue()
      item.checked = true
      return item
    })
  }
}
