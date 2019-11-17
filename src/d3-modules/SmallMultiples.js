import * as d3 from 'd3';
import EventEmitter from 'events';

export default class SmallMultiples extends EventEmitter {
  constructor({
    element,
    height = 200,
  } = {}) {
    super();
    this.height = height;
    this.multiples = [];

    this.svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('preserveAspectRatio', 'none');
  }

  addSmallMultiple(sm) {
    this.multiples.push(sm);
    this.svg.height = this.height * this.multiples.height;
  }

  draw(data) {
    this.x.domain(d3.extent(data, d => d.t));
    this.y.domain([0, d3.max(data, d => d.w)]);

    // / subdivide in groups
  }
}
