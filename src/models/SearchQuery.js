import FilterFactory from './FilterFactory';
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
      { type: 'isFront' },
      { type: 'hasTextContents' },
    ],
  } = {}) {
    this.uuid = uuid.v4();
    this.filterIds = [];
    this.filters = [];
    // forEach with hash to avoid dupes
    filters.forEach(d => this.addFilter(d));
  }

  addFilter(filter) {
    const filterItem = filterize(filter);
    const hash = filterItem.getHash();
    if (this.filtersIds.indexOf(hash) === -1) {
      this.filtersIds.push(hash);
      this.filters.push(filter);
    }
  }

  removeFilter(filter) {
    const idx = this.filtersIds.indexOf(filterize(filter).getHash());

    if (idx !== -1) {
      this.filtersIds.splice(idx, 1);
      this.filters.splice(idx, 1);
    }
  }

  getFilters(exclude = []) {
    // const types = this.filters.map(d => d.type);
    let filters = this.filters.map(filter => filter.getQuery());

    filters = filters.filter(i => i);
    filters = filters.filter(i => exclude.includes(i.type) === false);

    return filters;
  }
}
