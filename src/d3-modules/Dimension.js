import * as d3 from 'd3';

const TYPE_DISCRETE = 'TYPE_DISCRETE';
const TYPE_CONTINUOUS = 'TYPE_CONTINUOUS';

class Dimension {
  constructor({
    name = '',
    type = '',
    property,
    scaleFn,
    domain = [0, 1],
    range = [0, 1],
    isRangeFixed = false,
  } = {}) {
    this.name = name;
    this.property = property;
    this.type = type;
    // if(this.type === )
    this.scaleFn = scaleFn;
    this.domain = domain;
    this.range = range;
    this.isRangeFixed = isRangeFixed;

    if (this.type === TYPE_DISCRETE) {
      this.scale = this.scaleFn(d3.schemeSpectral[this.domain.length])
        .domain(this.domain);
    } else {
      this.scale = this.scaleFn()
        .domain(this.domain)
        .range(this.range);
    }
  }

  /**
   * getNearestValue
   * @param  {Number} v [description]
   * @return {Object}   [description]
   */
  getNearestValue(v) {
    if (!this.values) {
      throw new Error('this.values not set in dimension, do update() before calling getNearestValue');
    }
    const idx = d3.bisectLeft(this.values, v);

    if (idx === 0) {
      return {
        index: 0,
        nearest: this.values[0],
      };
    }

    const d0 = this.values[idx - 1];
    const d1 = this.values[idx];

    if (Math.abs(v - d0) > Math.abs(v - d1)) {
      return {
        index: idx,
        nearest: d1,
      };
    }
    return {
      index: idx - 1,
      nearest: d0,
    };
  }

  setDomain({
    domain = [],
    fixed = true,
  } = {}) {
    if (!domain.length) {
      return;
    }
    this.domain = domain;
    this.isDomainFixed = fixed;
    this.scale = this.scaleFn()
      .domain(this.domain)
      .range(this.range);
  }
  /**
   * If type is TYPE_CONTINUOUS, values should be a flattened array of values
   * so that the min/max extent for the domain can easily be computated.
   *
   * @param  {[type]} property [description]
   * @param  {[type]} values   [description]
   * @return {[type]}          [description]
   */
  update({ property, values, range }) {
    this.values = values.map(d => d[this.property]);
    if (property) {
      this.property = property;
    }
    if (this.range && range) {
      this.range = range;
    }
    if (!this.isDomainFixed) {
      this.domain = [];
    }
    this.legend = [];
    // recalculate cat according to type
    if (this.type === TYPE_DISCRETE) {
      const groups = Dimension.groupBy(values, this.property);
      this.domain = Object.keys(groups);
      this.scale = this.scaleFn(d3.schemeSpectral[this.domain.length + 2])
        .domain(this.domain);
      this.domain.forEach((key) => {
        this.legend.push({
          name: key,
          count: groups[key].length,
          color: this.scale(key),
        });
      });
    } else {
      if (!this.isDomainFixed) {
        this.domain = d3.extent(values, d => d[this.property]);
      }
      this.scale = this.scaleFn()
        .domain(this.domain)
        .range(this.range);
    }
  }

  accessor() {
    return d => this.scale(d[this.property]);
  }

  /**
   * Group cateogories
   * @param  {Array} arr      [description]
   * @param  {String} property [description]
   * @return {Object} groups
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
}
Dimension.TYPE_DISCRETE = TYPE_DISCRETE;
Dimension.TYPE_CONTINUOUS = TYPE_CONTINUOUS;

export default Dimension;
