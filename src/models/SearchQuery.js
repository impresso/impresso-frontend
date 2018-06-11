/**
 * @class SearchQuery is an object representing Search Query we can send to the api
 * @param {Integer} df Document Frequency
 */

 const uuid = require('uuid');

 export default function SearchQuery({
   filters = [],
 } = {}) {
   this.filters = filters;
   this.uuid = uuid.v4();
 }
