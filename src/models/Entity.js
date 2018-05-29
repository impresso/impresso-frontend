/**
 * @class Entity is an object representing a Named Entity (NE) such as a location or person
 * @param {Integer} df Document Frequency
 * @param {Array} labels Array with labels as strings
 * @param {String} name Name of the Namend Entity
 * @param {String} uid Unique identifier for the Named Entity
 */
export default function Entity({
  df = 0,
  labels = [],
  name = '',
  uid = '',
} = {}) {
  this.df = parseInt(df, 10);
  this.labels = labels.map(label => String(label));
  this.name = String(name);
  this.uid = String(uid);
}
