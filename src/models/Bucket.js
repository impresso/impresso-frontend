/**
 * @class Bucket is an object represnting a Solar search engine fascet bucket
 * @param {String} val The value of the dimenions, for instance a specific year,
 * language or newspaper title
 * @param {Number} count Number of matched results for this value
 */
export default function Bucket({
  val = '',
  count = 0,
} = {}) {
  this.val = String(val);
  this.count = parseInt(count, 10);
}
