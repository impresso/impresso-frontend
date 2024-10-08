import { v4 } from 'uuid'
import FilterBoolean from '@/models/FilterBoolean'
import FilterEntity from '@/models/FilterEntity'
import FilterString from '@/models/FilterString'
import FilterRegex from '@/models/FilterRegex'
import FilterNewspaper from '@/models/FilterNewspaper'
import FilterTopic from '@/models/FilterTopic'
import FilterItem from '@/models/FilterItem'
import FilterDaterange from '@/models/FilterDaterange'
import FilterCollection from '@/models/FilterCollection'

export default {
  /**
   * @param {object} filterData
   * @returns {import('.').Filter}
   */
  create: filterData => {
    let filter = { ...filterData }

    if (filterData.type === 'mention') {
      filter = new FilterString({
        ...filterData,
        type: 'mention', // we force EXACT string filter
        precision: 'EXACT'
      })
    }

    if (filterData.type === 'string') {
      filter = new FilterString(filterData)
    }

    if (filterData.type === 'title') {
      filter = new FilterString({
        ...filterData,
        type: 'title'
      })
    }

    if (['isFront', 'hasTextContents'].indexOf(filterData.type) > -1) {
      filter = new FilterBoolean(filterData)
    }

    if (filterData.type === 'regex') {
      filter = new FilterRegex(filterData)
    }

    if (['entity', 'person', 'location'].indexOf(filterData.type) !== -1) {
      filter = new FilterEntity(filterData)
    }

    if (
      [
        'country',
        'type',
        'language',
        'issue',
        'year',
        'accessRight',
        'partner',
        'textReuseClusterId'
      ].includes(filterData.type)
    ) {
      filter = new FilterItem(filterData)
    }

    if (filterData.type === 'newspaper') {
      filter = new FilterNewspaper(filterData)
    }

    if (filterData.type === 'topic') {
      filter = new FilterTopic(filterData)
    }

    if (filterData.type === 'daterange') {
      filter = new FilterDaterange(filterData)
    }

    if (filterData.type === 'collection') {
      filter = new FilterCollection(filterData)
    }

    if (filter.getHash != null) {
      filter.key = filterData.key || v4()
    }
    return filter
  }
}
