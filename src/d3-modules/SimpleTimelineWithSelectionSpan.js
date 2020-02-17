import * as d3 from 'd3';
import Basic from './Basic';

const DefaultSpanLabelFormatFn = (spanStartDate, spanEndDate) => {
  if (spanStartDate == null || spanEndDate === null) return undefined

  const diffMs = spanEndDate - spanStartDate
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365)
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 12)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffYears < 1) {
    if (diffMonths < 1) {
      const diff = diffDays < 1 ? 1 : diffDays
      return `${Math.floor(diff)} day${diff < 2 ? '' : 's'}`
    }
    return `${Math.floor(diffMonths)} month${diffMonths < 2 ? '' : 's'}`
  }
  return `${Math.floor(diffYears)} year${diffYears < 2 ? '' : 's'}`
}

export default class SimpleTimelineWithSelectionSpan extends Basic {
  constructor({
    svg = null,
    element = null,
    margin = {},
    dateLabelWidth = 30,
    dateFormat = '%Y',
    lineWidth = 1,
    spanLabelFormatFn = DefaultSpanLabelFormatFn
  } = {}) {
    super({
      element,
      svg,
      margin,
      dimensions: []
    })

    this.lineStroke = '#333'
    this.lineWidth = lineWidth
    this.selectionWidth = 6 * this.lineWidth
    this.fontSize = 11
    this.dateLabelWidth = dateLabelWidth
    this.dateFormat = d3.timeFormat(dateFormat)
    this.spanLabelFormatFn = spanLabelFormatFn

    this.timeline = this.g
      .append('g')
      .attr('class', 'timeline')

    this.timeLineScaler = d3.scaleTime()

    this.timeLineTransformer = d3.line()
      .x(timestamp => this.timeLineScaler(timestamp))
      .y(0)
    this.edgeTransformer = d3.line()
      .x(timestamp => this.timeLineScaler(timestamp))
      .y((d, idx) => (idx === 0 ? -1 : 1) * this.selectionWidth / 2)

    this.resize()
  }

  resize() {
    super.resize();
    this.svg.width = this.width;
    if (this.timeLineScaler) {
      this.timeLineScaler
	.range([
	  this.margin.left + this.dateLabelWidth,
	  this.width - this.margin.left - this.margin.right - this.dateLabelWidth
	])
      this.render()
    }
  }

  update({
    start, end,
    selectionStart, selectionEnd,
    height
  }) {
    let adjustedSelectionEnd;

    if (selectionEnd) {
      adjustedSelectionEnd = new Date(selectionEnd)
      adjustedSelectionEnd.setDate(selectionEnd.getDate() + 1)
    }

    this.timeLineScaler.domain([start, end])
    this.span = [start, end]
    this.selectionSpan = selectionStart != null && adjustedSelectionEnd != null
      ? [selectionStart, adjustedSelectionEnd]
      : undefined;
    if (this.height != null) this.svg.height = height;

    this.render()
  }

  render() {
    const effectiveHeight = this.height - this.margin.top - this.margin.bottom
    this.timeline
      .attr('transform', `translate(0, ${effectiveHeight - this.fontSize})`)

    this.timeline.selectAll('line.timeline')
      .data([this.span].filter(s => s != null))
      .join('path')
      .attr('class', 'timeline')
      .attr('stroke', this.lineStroke)
      .attr('stroke-width', this.lineWidth)
      .attr('d', this.timeLineTransformer)

    this.timeline.selectAll('line.edge')
      .data(this.span || [])
      .join('path')
      .attr('class', 'edge')
      .attr('stroke', this.lineStroke)
      .attr('stroke-width', this.lineWidth * 2)
      .attr('d', date => this.edgeTransformer([date, date]))

    this.timeline.selectAll('text.label')
      .data(this.span || [])
      .join('text')
      .attr('x', this.timeLineScaler)
      .attr('text-anchor', (d, idx) => idx === 0 ? 'end' : 'start')
      .attr('font-size', this.fontSize)
      .attr('dy', this.selectionWidth / 4)
      .attr('dx', (d, idx) => (idx === 0 ? -1 : 1) * this.selectionWidth / 2)
      .text(this.dateFormat)

    this.timeline.selectAll('line.selection')
      .data([this.selectionSpan].filter(s => s != null))
      .join('rect')
      .attr('class', 'selection')
      .attr('stroke', this.lineStroke)
      .attr('height', this.selectionWidth)
      .attr('y', - this.selectionWidth / 2)
      .attr('x', ([startDate]) => {
	return this.timeLineScaler(startDate)
      })
      .attr('width', (d) => {
	const [x0, x1] = d.map(this.timeLineScaler)
	return x1 - x0 < 1 ? 1 : x1 - x0
      })

    this.timeline.selectAll('text.span-label')
      .data([this.selectionSpan].filter(s => s != null))
      .join('text')
      .attr('x', ([startDate, endDate]) => {
	const diffMs = endDate - startDate
	const middleDate = new Date(startDate.getTime() + diffMs / 2)
	return this.timeLineScaler(middleDate)
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', this.fontSize)
      .attr('dy', - this.selectionWidth)
      .text(d => this.spanLabelFormatFn(...d))
  }
}