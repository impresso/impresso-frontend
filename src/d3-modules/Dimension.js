import * as d3 from 'd3';

const TYPE_ORDINAL = 'ordinal';

export default class Dimension {
  constructor({
    property = null,
    domain = [0, 1],
    range = [0, 1],
    scale = d3.scaleOrdinal,
    type = TYPE_ORDINAL, // or numerical
  } = {}) {
    console.log('CONSTRUCTOR FOR DIMENSION', property);
    this.property = property;
    this.type = type;
    this.scale = scale()
      .domain(domain)
      .range(range);
  }
  /**
   * [groupBy description]
   * @param  {Array} arr      [description]
   * @param  {String} property [description]
   * @return {Object}          groups 
   */
  static groupBy(arr, property) {
    return arr.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

  update({ property }) {
    this.property = property;
    // recalculate cat according to type

    return this;
  }

  setDomain(domain) {
    this.scale = this.scale.domain(domain);
  }

  accessor() {
    console.log('accessor', this.property);
    return d => this.scale(d[this.property]);
  }
}
