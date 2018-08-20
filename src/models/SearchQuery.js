import FilterFactory from './FilterFactory';
/**
 * @class SearchQuery is an object representing Search Query we can send to the api
 */

const uuid = require('uuid');

export default function SearchQuery({
  filters = [],
} = {}) {
  this.filters = filters.map(filter => FilterFactory.create(filter));
  this.uuid = uuid.v4();
}
