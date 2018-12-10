/**
 * @class Bucket is an object represnting a Solar search engine fascet bucket
 * @param {String} val The value of the dimenions, for instance a specific year,
 * language or newspaper title
 * @param {Number} count Number of matched results for this value
 * @param {Object} item Optional object of for instance type Newspaper or Entity
 */
export default class Bucket {
  constructor({
    val = '',
    count = 0,
    item = {},
    included = true,
  } = {}) {
    this.val = String(val);
    this.count = parseInt(count, 10);
    this.item = item;
    this.included = included;
  }
}
