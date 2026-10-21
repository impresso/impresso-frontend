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
import { Filter } from '@/models'
import { isEqual } from 'lodash'

type FilterData = Omit<Partial<Filter>, 'type' | 'q'> & {
  type: string
  q?: unknown
  key?: string
  items?: unknown[]
  getHash?: unknown
}

const buildFilter = (filterData: any | Filter): Filter => {
  let filter = { ...filterData }

  if (filterData.type === 'mention') {
    filter = new FilterString({
      ...filterData,
      type: 'mention', // we force EXACT string filter
      precision: 'exact'
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

  if (['entity', 'person', 'location', 'organisation', 'nag'].indexOf(filterData.type) !== -1) {
    filter = new FilterEntity(filterData)
  }

  if (
    [
      'country',
      'type',
      'language',
      'issue',
      'year',
      'copyright',
      'partner',
      'textReuseClusterId',
      'embedding'
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

  return filter as Filter
}

/**
 * Flattens the `q` property of a filter to a single string.
 * @param q
 * @returns
 */
const flattenFilterQ = (q: Filter['q']): string => (Array.isArray(q) ? q.join(' ') : (q ?? ''))

const normalizeFilter = (filter: Filter) => {
  const { key, items, q, ...rest } = filter as FilterData
  return { ...rest, q: flattenFilterQ(q as Filter['q']) }
}

const filtersAreEqual = (a: Filter, b: Filter): boolean =>
  isEqual(normalizeFilter(a), normalizeFilter(b))

const filterFactory = {
  /**
   * Creates a typed {@link Filter} from raw filter data.
   * A stable UUID `key` is assigned when the resulting filter exposes a
   * `getHash` method (i.e. it supports identity tracking).
   *
   * @param filterData - Plain object describing the filter.
   * @returns A fully constructed Filter instance.
   */
  create(filterData: Filter | FilterData): Filter {
    const source = filterData as Partial<FilterData>
    const filter = buildFilter(source)

    if ((filter as FilterData).getHash != null) {
      ;(filter as FilterData).key = source.key ?? v4()
    }

    return filter
  },

  /** @see {@link filtersAreEqual} */
  filtersAreEqual
}

export default filterFactory
