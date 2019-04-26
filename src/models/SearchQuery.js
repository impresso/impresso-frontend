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
      { type: 'hasTextContents' },
    ],
  } = {}) {
    this.uuid = uuid.v4();
    this.filtersIds = [];
    this.filters = [];
    this.filtersIndex = {}; // grouped by type
    // forEach with hash to avoid dupes
    filters.forEach(d => this.addFilter(d));
  }

  getFilter(filter) {
    const filterized = filterize(filter);
    const idx = this.filtersIds.indexOf(filterized.getHash());
    if (idx !== -1) {
      return filterized;
    }
    return null;
  }

  addFilter(filter) {
    const filterized = filterize(filter);
    const hash = filterized.getHash();
    // check if the has exists.
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

  enrichFilters(filters) {
    filters.forEach((d) => {
      if ((d.items && d.items.length) || (d.item && d.item.uid)) {
        const filterized = filterize(d);
        const idx = this.filtersIds.indexOf(filterized.getHash());
        if (idx !== -1) {
          console.log('enrichFilters: found', d.type, d, filterized);
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

  updateFilter(filter, hash) {
    const filterized = filterize(filter);
    const idx = hash ? this.filtersIds.indexOf(hash) :
      this.filtersIds.indexOf(filterized.getHash());
    if (idx !== -1) {
      this.filters[idx].q = this.filters[idx].q.concat(this.filters[idx].shadowQ);
    }
  }

  resetFilter(type) {
    this.filters.filter(d => d.type === type).forEach(d => this.removeFilter(d));
  }

  removeFilter(filter) {
    const filterized = filterize(filter);
    const idx = this.filtersIds.indexOf(filterized.getHash());

    if (idx !== -1) {
      this.filtersIds.splice(idx, 1);
      this.filters.splice(idx, 1);
      this.filtersIndex[filterized.type].splice(idx, 1);
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
