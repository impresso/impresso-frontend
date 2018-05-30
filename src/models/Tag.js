/**
 * @class Tag is an object representing a Tag
 * @param {Array} appliesTo Array of Strings
 * @param {String} description Description of the tag
 * @param {Array} labels Array with labels as strings
 * @param {String} name Name of the tag
 * @param {String} uid Unique identifier for the Named Entity
 */
export default function Tag({
  appliesTo = [],
  description = '',
  labels = [],
  name = '',
  uid = '',
} = {}) {
  this.appliesTo = appliesTo.map(label => String(label));
  this.description = String(description);
  this.labels = labels.map(label => String(label));
  this.name = String(name);
  this.uid = String(uid);
}
