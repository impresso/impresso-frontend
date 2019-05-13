import * as d3 from 'd3';
import Timeline from './Timeline';
import Dimension from './Dimension';

export default class ContrastTimeline extends Timeline {
  constructor({
    element = null,
    svg = null,
    margin = {},
    format = '%Y',
    domain = [],
  } = {}) {
    super({
      element,
      svg,
      format,
      margin,
      domain,
    });

    this.dimensions.contrast = new Dimension({
      name: 'contrast',
      property: 'w1',
      type: Dimension.TYPE_CONTINUOUS,
      scaleFn: d3.scaleLinear,
    });

    this.contextAreaContrast = this.context.append('path')
      .attr('class', 'area contrast');

    this.contextPointerContrast = this.context.append('circle')
      .attr('r', 3)
      .attr('class', 'pointer contrast');

    this.on('mousemove', this.movePointer);
    this.on('highlighted', this.movePointer);
  }

  movePointer({ pointer, datum }) {
    const pointerY = this.dimensions.contrast.scale(datum[this.dimensions.contrast.property]);
    this.contextPointerContrast
      .classed('active', true)
      .attr('transform', `translate(${pointer.x},${pointerY})`);
  }

  draw() {
    super.draw();
    // setup curve
    this.curveContrast = d3.line()
      .curve(d3.curveLinear)
      .x(this.dimensions.x.accessor())
      .y(this.dimensions.contrast.accessor());

    this.contextAreaContrast.datum(this.data).attr('d', this.curveContrast);
  }

  update({
    data = [],
  } = {}) {
    super.update({
      data,
    });
    console.log('update contrast dimension', this.dimensions.y.domain);
    this.dimensions.contrast.setDomain({
      domain: this.dimensions.y.domain,
    });
    this.dimensions.contrast.update({
      values: data,
      domain: this.dimensions.y.domain,
      range: [this.height - this.margin.top - this.margin.bottom, 0],
    });
  }

  mouseenter() {
    this.contextPointerContrast.classed('active', true);
    super.mouseenter();
  }

  mouseleave() {
    this.contextPointerContrast.classed('active', false);
    super.mouseleave();
  }
}
