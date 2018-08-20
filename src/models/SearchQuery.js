import Filter from './Filter';
/**
 * @class SearchQuery is an object representing Search Query we can send to the api
 */

const uuid = require('uuid');

export default function SearchQuery({
  filters = [],
} = {}) {
  this.filters = filters.map(filter =>
    (filter instanceof Filter ? filter : new Filter(filter)),
  );
  this.uuid = uuid.v4();
}
