import { protobuf } from 'impresso-jscommons';
import FilterFactory from '@/models/FilterFactory';


/**
 * @class SearchQuery is an object representing Search Query we can send to the api
 */

const uuid = require('uuid');

const filterize = (filter) => {
  if (typeof filter.getHash !== 'function') {
    return FilterFactory.create(filter);
  }
  return filter;
};

export default class SearchQuery {
  constructor({
    filters = [
      // { type: 'isFront' },
      // { type: 'hasTextContents' },
    ],
  } = {}) {
    this.uuid = uuid.v4();
    this.filtersIds = [];
    this.filters = [];
    this.filtersIndex = {}; // grouped by type
    // forEach with hash to avoid dupes
    filters.forEach(d => this.addFilter(d));
  }

  static serialize({ filters = [], page = 0, groupBy = 'articles', orderBy = undefined } = {}, serializer = 'json') {
    if (serializer === 'protobuf') {
      return protobuf.searchQuery.serialize({ filters });
    }

    const query = {
      f: JSON.stringify(filters),
      g: groupBy,
    };

    if (page) {
      query.p = page;
    }

    if (orderBy) {
      query.o = orderBy;
    }
    return query;
  }

  getSerialized({
    serializer = 'json',
  } = {}) {
    return SearchQuery.serialize({
      filters: this.getFilters(),
    }, serializer);
  }

  getFilter(filter) {
    const filterized = filterize(filter);
    if (!filterized.hash) {
      filterized.hash = filterized.getHash();
    }
    const idx = this.filtersIds.indexOf(filterized.hash);
    if (idx !== -1) {
      return filterized;
    }
    return null;
  }

  addFilter(filter) {
    const filterized = filterize(filter);
    const hash = filterized.getHash();
    // check if the filter do not exists.
    if (this.filtersIds.indexOf(hash) === -1) {
      this.filtersIds.push(hash);
      this.filters.push(filterized);
      // add to filter index dictionary (by filter type), create the index
      // if it does not exist
      if (!Array.isArray(this.filtersIndex[filterized.type])) {
        this.filtersIndex[filterized.type] = [];
      }
      this.filtersIndex[filterized.type].push(filterized);
    }
  }

  mergeFilterAtIndex(filter, idx) {
    const originalFilter = this.filters[idx]

    originalFilter.q = filter.q
    originalFilter.op = filter.op
    originalFilter.precision = filter.precision
    originalFilter.distance = filter.distance
    originalFilter.context = filter.context

    // NOTE: Hotfix. There is a discrepancy between items ids in `q`
    // and ids in `items`. Get rid of items that are not present in `q`.
    // One of the cases where it happens is when filtering by id of a collection
    // not owned by current user.
    const mergeableItems = (filter.items || []).filter(item => filter.q.includes(item.uid))

    if (mergeableItems.length > 0) {
      const uids = [];
      const items = [];
      // combine the two lists of items;
      originalFilter.items.concat(mergeableItems).forEach((d) => {
        if (!uids.includes(d.uid)) {
          uids.push(d.uid);
          items.push(d);
        }
      });

      originalFilter.setItems(items);
      originalFilter.q = uids;
    }
    // recalculate hash and reset at filtersIds index:
    this.filtersIds[idx] = originalFilter.getHash();
  }

  enrichFilters(filters) {
    filters.forEach((d) => {
      if ((d.items && d.items.length) || (d.item && d.item.uid)) {
        const filterized = filterize(d);
        const idx = this.filtersIds.indexOf(filterized.getHash());
        if (idx !== -1) {
          if (filterized.item) {
            this.filters[idx].item = filterized.item;
          } else if (filterized.items) {
            this.filters[idx].setItems(filterized.items);
          }
        }
      }
    });
  }

  updateFilters(filters) {
    this.filtersIds = [];
    this.filters = [];
    this.filtersIndex = {};
    filters.forEach(d => this.addFilter(d));
  }

  updateFilter({ filter, q, op, items, context, precision, distance }) {
    const fil = this.getFilter(filter);
    if (!fil) {
      return;
    }
    if (q) {
      fil.q = q;
    }
    if (op) {
      fil.op = op;
    }
    if (precision) {
      fil.precision = precision;
    }
    if (distance) {
      fil.distance = distance;
    }
    if (context) {
      fil.context = context;
    }
    if (items) {
      fil.items = items;
    }
    fil.touched = fil.getHash() !== fil.hash;
  }

  updateFilterItem({ filter, item, uid }) {
    const fil = this.getFilter(filter);
    if (!fil) {
      return;
    }
    fil.items = fil.items.map((d) => {
      if (uid && d.uid === uid) {
        return item;
      } else if (d.uid === item.uid) {
        return item;
      }
      return d;
    });
    fil.q = fil.items.filter(d => d.checked).map(d => d.uid);
    fil.touched = fil.getHash() !== fil.hash;
  }

  resetFilter(type) {
    this.filters.filter(d => d.type === type).forEach(d => this.removeFilter(d));
  }

  removeFilter(filter) {
    const fil = this.getFilter(filter);
    if (!fil) {
      return;
    }
    const idx = this.filtersIds.indexOf(fil.hash);

    if (idx !== -1) {
      this.filtersIds.splice(idx, 1);
      this.filters.splice(idx, 1);
      this.filtersIndex[fil.type].splice(idx, 1);
    }
  }

  /**
   * Get filters as query. Return a concatenation of
   * filters to be put in a querystring
   * @param  {Array}  [exclude=[]] specify which types to exclude
   * @return {[type]}              [description]
   */
  getFilters(exclude = []) {
    let filters = this.filters
      .map(filter => filter.getQuery())
      .filter(i => i);
    if (exclude.length) {
      filters = filters.filter(i => exclude.includes(i.type) === false);
    }
    return filters;
  }
  /**
   * Similar to getFilters, without mapping. Return the number of active filters
   * @param  {options}  [{ ignoreTypes=['hasTextContents'] } = {}]
   * @return {number}
   */
  countActiveFilters({ ignoreTypes = ['hasTextContents'] } = {}) {
    return this.filters.filter(d => !ignoreTypes.includes(d.type)).length;
  }

  countActiveItems({ ignoreTypes = ['hasTextContents'] } = {}) {
    return this.filters.filter(d => !ignoreTypes.includes(d.type)).reduce((acc, d) => {
      if (d.items) {
        return acc + d.items.length;
      }
      return acc + 1;
    }, 0);
  }
  /**
   * get list of current types, minus default ones
   * @param  {Array}  [ignoreTypes=['hasTextContents'] } = {}] available options
   * @return {Array}  list of active filter types
   */
  getTypes({ ignoreTypes = ['hasTextContents'] } = {}) {
    return Object.keys(this.filtersIndex).filter(d => !ignoreTypes.includes(d));
  }
}
