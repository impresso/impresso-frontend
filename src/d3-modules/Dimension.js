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
  } = {}) {
    this.name = name;
    this.property = property;
    this.type = type;
    // if(this.type === )
    this.scaleFn = scaleFn;
    this.domain = domain;
    this.range = range;

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
   * If type is TYPE_CONTINUOUS, values should be a flattened array of values
   * so that the min/max extent for the domain can easily be computated.
   *
   * @param  {[type]} property [description]
   * @param  {[type]} values   [description]
   * @return {[type]}          [description]
   */
  update({ property, values }) {
    this.property = property;
    this.domain = [];
    this.legend = [];
    // recalculate cat according to type
    if (this.type === TYPE_DISCRETE) {
      const groups = Dimension.groupBy(values, this.property);
      this.domain = Object.keys(groups);
      this.scale = this.scaleFn(d3.schemeSpectral[this.domain.length])
        .domain(this.domain);
      this.domain.forEach((key) => {
        this.legend.push({
          name: key,
          count: groups[key].length,
          color: this.scale(key),
        });
      });
    } else {
      this.domain = d3.extent(values, d => d[this.property]);
      this.scale = this.scale
        .domain(this.domain);
    }
  }

  accessor() {
    console.log('accessor', this.property);
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
