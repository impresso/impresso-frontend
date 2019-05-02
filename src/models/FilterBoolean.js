import Filter from '@/models/FilterBase';
/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 */

export default class FilterBoolean extends Filter {
  getName() {
    return this.item.name;
  }

  getQuery() {
    return {
      type: this.type,
    };
  }
}
