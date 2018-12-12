/**
 * @class AutocompleteSearchResult is an object representing a single search result
 * form the autocomplete api
 * @param {String} title Human readable title for display in lists
 * @param {Object} filter Filter object used for the search api, see modules/filters
 * @param {Object} data The raw data returned from the search
 * @param {String} label String representing the type of result (person, location, etc.)
 */
export default class AutocompleteSearchResult {
  constructor({
    title = '',
    filter = {},
    data = {},
    label, // single type of the result
  } = {}) {
    this.title = title;
    this.filter = filter;
    this.data = data;
    this.label = label;
  }
}
