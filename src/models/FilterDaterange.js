import Filter from '@/models/FilterBase';
import Daterange from '@/models/Daterange';

/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 * @param {Entity} entity Entity object
 */

export default class FilterDaterange extends Filter {
  constructor({
    type = 'daterange',
    context = 'include',
    start = null,
    end = null,
    daterange = '',
  } = {}) {
    super({
      type,
      context,
    });
    this.daterange = new Daterange({
      start,
      end,
      daterange,
    });
    console.log('FilterDaterange loaded daterange', this.daterange);
  }

  getQuery() {
    this.daterange.start.setHours(0, 0, 0, 0); // make sure we only use dates, not times
    this.daterange.end.setHours(0, 0, 0, 0);
    const daterange = `${this.daterange.start.toISOString().replace('.000Z', 'Z')} TO ${this.daterange.end.toISOString().replace('.000Z', 'Z')}`;

    return {
      context: this.context,
      type: this.type,
      daterange,
    };
  }
}
