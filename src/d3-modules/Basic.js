import * as d3 from 'd3'
import EventEmitter from 'events'

export default class Basic extends EventEmitter {
  constructor({ svg = null, element = null, dimensions = {}, margin = {} } = {}) {
    super()
    this.dimensions = dimensions
    this.element = element
    this.margin = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      ...margin
    }
    if (svg) {
      this.svg = svg
    } else {
      this.svg = d3.select(element).append('svg').attr('preserveAspectRatio', 'none')
    }
    this.svg.on('click', () => {
      this.emit('svg.click')
    })

    this.g = this.svg.append('g').attr('class', 'm')
    this.emit('svg.init')
    // this.resize();
  }

  /**
   * Set the appropriate property and updete function range.
   * @param  {String} name key for this.dimensions object
   * @param  {String} property property name in datum
   * @param  {Array|Object} values Array or Object, according to Dimension type
   * @return {null}
   */
  updateDimension({ name, property, values, range }) {
    this.dimensions[name].update({
      property,
      values,
      range
    })
    this.emit('dimension.updated', this.dimensions[name])
  }

  // getNearestValue(year) {
  //   const idx = d3.bisectLeft(this.values, year);
  //
  //   const d0 = this.values[idx - 1];
  //   const d1 = this.values[idx];
  //
  //   return Math.abs(year - d0) > Math.abs(year - d1) ? d1 : d0;
  // },
  /**
   * Set this.with and this.height;
   * then resize svg container.
   * using the given margin
   * @return {null}
   */
  resize() {
    let rect = {}
    if (this.element) {
      rect = this.element.getBoundingClientRect()
    } else {
      rect = this.svg.node().parentNode.getBoundingClientRect()
    }
    this.width = +rect.width
    this.height = +rect.height
    // set svg properties directly
    this.svg.attr('width', this.width).attr('height', this.height)

    this.emit('svg.resized')
  }
}
