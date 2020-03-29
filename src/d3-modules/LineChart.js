import * as d3 from 'd3'
import Basic from '@/d3-modules/Basic';

export default class LineChart extends Basic{
  constructor({
    element = null,
    margin = { top: 5, bottom: 125, left: 45, right: 5}
  }) {
    super({
      element,
      margin,
    });

    this.svg
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    // setup main context (mousemove on the whole area)
    this.context = this.g.append('g')
      .classed('context', true)
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    this.contextBackground = this.context.append('rect');
    this.axes = this.g.append('g').attr('class', 'axes')
    this.lines = this.g.append('g').attr('class', 'lines')
    this.areas = this.g.append('g').attr('class', 'areas')
    // add addEventListeners
    this.context.on('mousemove', this.mousemove.bind(this));
    this.resize();
  }

  mousemove(a, b, el) {
    const [mouseX, mouseY] = d3.mouse(el[0]);
    const scaledX = this.dimensions.x.scale.invert(mouseX);
    const { index, nearest } = this.dimensions.x.getNearestValue(scaledX);

    if (index === -1) return

    console.info('@mousemove', mouseX, mouseY, index, nearest, scaledX );
  }

  resize() {
    super.resize();
    if (this.data) {
      this.render(this.data, this.lineMetrics, this.areaMetrics, this.options);
    }
  }

  update(data, lineMetrics = [], areaMetrics = [], options = {}) {
    this.data = data;
    this.lineMetrics = lineMetrics;
    this.areaMetrics = areaMetrics;
    this.options = options;
    this.render(this.data, this.lineMetrics, this.areaMetrics, this.options);
  }

  /**
   * @typedef {{ domain: Date, value: any }} DataItem
   * @typedef {(any) => number} LineValueExtractor
   * @typedef {(any) => [number, number]} AreaValueExtractor
   *
   * @param {DataItem[]} data
   * @param {{ id: string, extractor: LineValueExtractor}[]} lineMetrics
   * @param {{ id: string, extractor: AreaValueExtractor}[]} areaMetrics
   * @param {{ colorPalette?: {[key: string]: string} }} options
   */
  render(data, lineMetrics = [], areaMetrics = [], options = {}) {
    const { width, height } = this;
    const { colorPalette = {} } = options

    this.contextBackground
      .attr('width', this.width - this.margin.right - this.margin.left)
      .attr('height', this.height - this.margin.bottom - this.margin.top);
    // X
    const x = d3.scaleUtc()
      .domain(/** @type {Date[]} */ (d3.extent(data, d => d.domain)))
      .range([this.margin.left, width - this.margin.right])

    const xAxis = g => g
      .attr('transform', `translate(0,${height - this.margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    this.axes
      .selectAll('g.x')
      .data([null])
      .join('g')
      .attr('class', 'x')
      .call(xAxis)

    const maxYLines = /** @type {number} */ (d3.max(data, d => d3.max(lineMetrics.map(({ extractor }) => extractor(d.value)))))
    const maxYAreas = /** @type {number} */ (d3.max(data, d => d3.max(areaMetrics.flatMap(({ extractor }) => extractor(d.value)))))
    const maxY = /** @type {number} */ (d3.max([maxYLines, maxYAreas]))

    // Y
    const y = d3.scaleLinear()
      .domain([0, maxY]).nice()
      .range([height - this.margin.bottom, this.margin.top])

    const yAxis = g => g
      .attr('transform', `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('.tick:last-of-type text').clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold'))

    this.axes
      .selectAll('g.y')
      .data([null])
      .join('g')
      .attr('class', 'y')
      .call(yAxis)

    // lines
    const line = d3.line()
      .defined(([, value]) => !isNaN(value))
      .x(([date]) => x(date))
      .y(([, value]) => y(value))

    const linesContainers = this.lines
      .selectAll('g')
      .data(lineMetrics)
      .join('g')
      .attr('class', ({ id }) => id)

    // Areas

    // @ts-ignore
    const area = (/** @type {d3.Area<[Date, [number, number]]>} */ (d3.area()))
      .defined(([, [y0, y1]]) => [y0, y1].every(v => !isNaN(v)))
      .x(([date]) => x(date))
      .y0(([, [y0]]) => y(y0))
      .y1(([, [, y1]]) => y(y1))

    this.areas
      .selectAll('path')
      .data(() => /** @type {[[Date, [number, number]][], string][]} */ (
        areaMetrics.map(({ id, extractor }) => [data.map(({ domain, value }) => [domain, extractor(value)]), id])
      ))
      .join('path')
      .attr('class', ([, id]) => id)
      .attr('fill', ([, id]) => colorPalette[id])
      .attr('d', ([items]) => area(items))

    // Lines

    /**
     * @param {{ id: string, extractor: LineValueExtractor}} metric
     * @param {number} index
     */
    const pathItem = (metric, index) => {
      const lineData = data
        .map(d => /** @type {[number, number]} */ ([d.domain.getTime(), metric.extractor(d.value)]))
      return [{ metric: metric.id, index, data: lineData }]
    }

    // line with data and missing data points
    linesContainers
      .selectAll('path.missing')
      .data((metric, index) => {
        const { data } = pathItem(metric, index)[0]
        return [{ metric: metric.id, index, data: data.filter(line.defined()) }]
      })
      .join('path')
      .attr('class', 'missing')
      .attr('stroke', '#eee')
      .attr('d', ({ data }) => line(data));

    // line with data
    linesContainers
      .selectAll('path.metric')
      .data(pathItem)
      .join('path')
      .attr('class', 'metric')
      .attr('stroke', ({ metric }) => colorPalette[metric])
      .attr('stroke-width', 1.5)
      .attr('d', ({ data }) => line(data))
  }
}
