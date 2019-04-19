import * as d3 from 'd3';
import Line from './Line';
import Dimension from './Dimension';

export default class Timeline extends Line {
  constructor({
    element = null,
    svg = null,
    margin = {},
    format = '%Y',
    domain = [],
    brushable = false,
  } = {}) {
    super({
      element,
      svg,
      margin: {
        top: 10,
        bottom: 20,
        left: 10,
        right: 10,
        ...margin,
      },
      dimensions: {
        x: new Dimension({
          name: 'x',
          property: 't',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleTime,
        }),
        y: new Dimension({
          name: 'y',
          property: 'w',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleLinear,
        }),
      },
    });

    this.timeFormat = d3.timeFormat(format);
    this.timeParse = d3.timeParse(format);
    this.contextAxisX = this.context.append('g')
      .attr('class', 'axis axis--x');
    if (domain.length) {
      this.dimensions.x.setDomain({
        domain: domain.map(d => this.timeParse(d)),
      });
    }

    this.brushable = brushable;
    if (brushable) {
      this.brush = d3.brushX()
        .extent([[0, 0], [
          this.width - this.margin.right - this.margin.left,
          this.height - this.margin.bottom - 3,
        ]])
        .on('brush end', this.brushed.bind(this));
      this.contextBrush = this.context.append('g')
        .attr('class', 'brush')
        .call(this.brush);
    }
  }

  brushed() {
    if (d3.event.sourceEvent) {
      console.log('@brushed', d3.event.sourceEvent.type);
    }
    console.log('@brushed. range:', d3.event.selection, this.dimensions.x);
    // const s = d3.event.selection || this.dimensions.x.range;
  }

  brushTo({ min, max }) {
    if (!min || !max) {
      return;
    }
    this.contextBrush.call(this.brush.move, [
      this.dimensions.x.scale(min),
      this.dimensions.x.scale(max),
    ]);
  }

  draw() {
    super.draw();
    this.xAxis2 = d3.axisBottom(this.dimensions.x.scale)
      .tickFormat(this.timeFormat);
    this.contextAxisX.call(this.xAxis2);
    this.contextAxisX.attr('transform',
      `translate(0,${this.height - this.margin.bottom - this.margin.top})`);
  }

  /**
   * Ensure we deal with dates
   * @param  {Array}  [data=[]               } = {}] [description]
   * @return {[type]}          [description]
   */
  update({
    data = [],
  } = {}) {
    super.update({
      data: data.map(d => ({
        ...d,
        t: this.timeParse(d.t),
      })),
    });
  }

  /**
   * Highlight current datum if any
   * @param  {[type]} datum [description]
   * @return {[type]}       [description]
   */
  highlight(datum) {
    if (datum) {
      super.highlight({
        ...datum,
        t: this.timeParse(datum.t),
      });
    }
  }
}
