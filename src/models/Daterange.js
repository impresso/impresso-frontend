/**
 * @class Daterange is a class representating a date range
 * @param {String} daterange String representing the daterange e.g.
 * "1900-01-01T00:00:00Z TO 1900-12-31T23:59:59Z"
 * @param {Date} start Date object start op of the range
 * @param {Date} end Date object end op of the range
 */
export default class Daterange {
  constructor({
    daterange = '',
    start = new Date(),
    end = new Date(),
  } = {}) {
    if (daterange.length > 0) {
      const range = daterange.split(' TO ');
      this.start = new Date(range[0]);
      this.end = new Date(range[1]);
    } else {
      this.start = new Date(start);
      this.end = new Date(end);
    }
    // make sure we only use dates, not times
    this.start.setUTCHours(0, 0, 0, 0);
    this.end.setUTCHours(23, 59, 59, 0);
    this.uid = this.getValue();
  }

  getValue() {
    return [
      this.start.toISOString().replace('.000Z', 'Z'),
      'TO',
      this.end.toISOString().replace('.000Z', 'Z'),
    ].join(' ');
  }
}
