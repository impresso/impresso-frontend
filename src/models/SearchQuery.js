import FilterFactory from './FilterFactory';
/**
 * @class SearchQuery is an object representing Search Query we can send to the api
 */

const uuid = require('uuid');

export default class SearchQuery {
  constructor({
    filters = [],
    isFront = false,
    hasTextContents = true,
  } = {}) {
    this.filters = filters.map(filter => FilterFactory.create(filter));
    this.isFront = isFront;
    this.hasTextContents = hasTextContents;
    this.uuid = uuid.v4();
  }

  getFilters(exclude = []) {
    let filters = this.filters.map(filter => filter.getQuery());

    filters = filters.filter(i => i);
    filters = filters.filter(i => exclude.includes(i.type) === false);

    if (this.isFront) filters.push({ type: 'isFront' });
    if (this.hasTextContents) filters.push({ type: 'hasTextContents' });

    return filters;
  }
}
