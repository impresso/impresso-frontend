import Collection from './Collection';

/**
 * @class Entity is an object representing a Named Entity (NE) such as a location or person
 * @param {Array} collections List of Collection objects the entity belongs to
 * @param {Integer} df Document Frequency
 * @param {Array} labels Array with labels as strings
 * @param {String} name Name of the Namend Entity
 * @param {String} uid Unique identifier for the Named Entity
 */
export default class Entity {
  constructor({
    collections = [],
    df = 0,
    labels = [],
    name = '',
    uid = '',
  } = {}) {
    this.collections = collections.map((collection) => {
      if (collection instanceof Collection) {
        return collection;
      }

      return new Collection(collection);
    });

    this.df = parseInt(df, 10);
    this.labels = labels.map(label => String(label));
    this.name = String(name);
    this.uid = String(uid);
  }

  hasLabel(needle) {
    return this.labels.find(label => label === needle);
  }

  getLabel(index) {
    return this.labels[index];
  }
}
