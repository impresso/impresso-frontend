import * as d3 from 'd3';
import EventEmitter from 'events';

export default class SkyLine extends EventEmitter {
  constructor(config) {
    super();

    this.svg = d3.select(config.element).append('svg')
      .attr('width', '100%')
      .attr('height', config.height)
      .attr('preserveAspectRatio', 'none');

    const svgDimensions = this.svg.node().getBoundingClientRect();

    this.margin = { top: 0, bottom: 110, left: 0 };
    this.margin2 = { top: config.height - 70, bottom: 30, left: 0 };
    this.width = +svgDimensions.width - this.margin.left;
    this.height = +svgDimensions.height - this.margin.bottom;
    this.height2 = +svgDimensions.height - this.margin2.top - this.margin2.bottom;

    this.x = d3.scaleTime().range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);

    this.xAxis = d3.axisBottom(this.x).tickSizeInner(-this.height - 6);
    this.yAxis = d3.axisRight(this.y).tickSizeInner(this.width).tickSizeOuter(-6);

    this.xAxis2 = d3.axisBottom(this.x2).tickFormat(d3.timeFormat('%Y'));

    this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height2]])
      .on('brush end', this.brushed.bind(this));

    this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .on('zoom', this.zoomed.bind(this))
      .on('end', () => {
        this.emit('zoomEnd', this.x.domain());
      });

    this.area = d3.line()
      .curve(d3.curveLinear)
      .x(d => this.x(d.year))
      .y(d => this.y(d.count));

    this.area2 = d3.line()
      .curve(d3.curveLinear)
      .x(d => this.x2(d.year))
      .y(d => this.y2(d.count));

    this.svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);

    this.focus = this.svg.append('g')
      .attr('class', 'focus')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.context = this.svg.append('g')
      .attr('class', 'context')
      .attr('transform', `translate(${this.margin2.left}, ${this.margin2.top})`);

    this.focusArea = this.focus.append('path')
      .attr('class', 'area');

    this.focusAxisX = this.focus.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${this.height})`);

    this.focusAxisY = this.focus.append('g')
      .attr('class', 'axis axis--y');

    this.contextArea = this.context.append('path')
      .attr('class', 'area');

    this.contextAxisX = this.context.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${this.height2})`);

    this.contextBrush = this.context.append('g')
      .attr('class', 'brush')
      .call(this.brush);

    this.zoomArea = this.svg.append('rect')
      .attr('class', 'zoom')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(this.zoom);

    this.focusPoints = this.svg.append('g')
      .attr('class', 'points')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.setTimeFormat(config.timeFormat || '%Y');
  }

  // call this function to change the time format
  setTimeFormat(timeFormat) {
    this.xAxis.tickFormat(d3.timeFormat(timeFormat));
    this.focusAxisX.call(this.xAxis);
  }

  brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;

    const s = d3.event.selection || this.x2.range();

    this.x.domain(s.map(this.x2.invert, this.x2));
    this.focusArea.attr('d', this.area);
    this.focusAxisX.call(this.xAxis);
    this.zoomArea.call(
      this.zoom.transform,
      d3.zoomIdentity
        .scale(this.width / (s[1] - s[0]))
        .translate(-s[0], 0));

    this.focusPoints.selectAll('circle.point')
      .attr('cx', d => this.x(d.year))
      .attr('cy', d => this.y(d.count));
  }

  zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
    const t = d3.event.transform;
    this.x.domain(t.rescaleX(this.x2).domain());
    this.focusArea.attr('d', this.area);
    this.focusAxisX.call(this.xAxis);
    this.contextBrush.call(this.brush.move, this.x.range().map(t.invertX, t));

    this.focusPoints.selectAll('circle.point')
      .attr('cx', d => this.x(d.year))
      .attr('cy', d => this.y(d.count));
  }

  zoomTo(startDate, endDate) {
    this.contextBrush.call(this.brush.move, [
      this.x2(new Date(startDate)),
      this.x2(new Date(endDate)),
    ]);
  }

  draw(data) {
    this.x.domain(d3.extent(data, d => d.year));
    this.y.domain([0, d3.max(data, d => d.count)]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());

    this.focusArea.datum(data).attr('d', this.area);

    this.focusPoints.selectAll('circle.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => this.x(d.year))
      .attr('cy', d => this.y(d.count))
      .attr('r', '3')
      .on('mouseover', (d, i) => {
        this.emit('mouseover', d, i);
      })
      .on('click', (d, i) => {
        this.emit('mousedown', d, i);
      });

    this.focusAxisX
      .call(this.xAxis)
      .selectAll('.tick')
      .attr('transform', d => `translate(${this.x(d)}, -6)`);

    this.focusAxisY
      .call(this.yAxis)
      .selectAll('.tick')
      .select('text')
      .attr('transform', () => `translate(${-this.width + 6}, 0)`);

    this.contextArea.datum(data).attr('d', this.area2);
    this.contextAxisX.call(this.xAxis2);
  }
}
