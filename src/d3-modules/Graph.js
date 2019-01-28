import * as d3 from 'd3';
import EventEmitter from 'events';
import Dimension from './Dimension';

export default class Graph extends EventEmitter {
  constructor({
    element = null,
    margin = {
      top: 10,
      bottom: 10,
      left: 10,
    },
    maxNodeRadius = 12,
    maxDistance = 50,
    delay = 30000,
    fixAfterDrag = true,
    nodeLabel = d => d.id,
    identity = d => d.id,
    // override current behaviour if needed,
    dimensions = {},
  } = {}) {
    super();

    this.svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'none')
      .on('click', () => {
        this.selected = null;
        this.emit('svg.click');
      });

    this.margin = margin;
    this.fixAfterDrag = fixAfterDrag;
    this.maxNodeRadius = parseInt(maxNodeRadius, 10);
    this.maxDistance = parseInt(maxDistance, 10);
    this.delay = parseInt(delay, 10);

    this.nodeLabel = nodeLabel;
    this.identity = identity;
    // set initial widh and height
    this.resize();
    // initialize graphic elements
    // init link and node collections
    this.linksLayer = this.svg.append('g')
      .classed('links', true)
      .selectAll('line');

    this.nodesLayer = this.svg.append('g')
      .classed('nodes', true)
      .selectAll('circle');

    // initialize force!
    this.simulation = d3.forceSimulation()
      .force('link',
        d3.forceLink()
          .id((d, k) => k)
          .distance(maxDistance)
          .strength(0.5))
      .force('center', d3.forceCenter(
        this.width / 2,
        this.height / 2))
      .force('charge', d3.forceManyBody()
        .distanceMin(this.maxNodeRadius))
      .alphaTarget(0.5)
      .on('tick', () => this.tick());

    // dimensions dict
    this.dimensions = {
      nodeColor: new Dimension({
        name: 'nodeColor',
        property: 'id',
        type: Dimension.TYPE_DISCRETE,
        scaleFn: d3.scaleOrdinal,
      }),
      nodeSize: new Dimension({
        name: 'nodeSize',
        property: 'degree',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scaleLinear,
        range: [4, this.maxNodeRadius],
      }),
      linkDistance: new Dimension({
        name: 'linkDistance',
        property: 'w',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scaleSqrt,
        range: [10, 200],
      }),
      ...dimensions,
    };

    this.stopSimulation();
  }

  applyDimensions() {
    this.nodesLayer
      .selectAll('.n')
      .transition()
      .attr('fill', this.dimensions.nodeColor.accessor())
      .attr('r', this.dimensions.nodeSize.accessor());

    // apply force
    this.simulation.force('link')
      .distance(this.dimensions.linkDistance.accessor());
      // strength(+this.value);
    this.simulation.alpha(1).restart();
  }

  /**
   * Set the appropriate property and updete function range.
   * @param  {String} name key for this.dimensions object
   * @param  {String} property
   * @param  {Array|Object} values Array or Object, according to Dimension type
   * @return {null}
   */
  updateDimension({ name, property, values }) {
    this.dimensions[name].update({
      property,
      values,
    });
    this.emit('dimension.updated', this.dimensions[name]);
  }

  /**
   * [tick description]
   * @return {null} [description]
   */
  tick() {
    this.nodesLayer.attr('transform', (d) => {
      d.y = Math.max(d.r, Math.min(this.height - d.r, d.y));
      d.x = Math.max(d.r, Math.min(this.width - d.r, d.x));
      return `translate(${d.x},${d.y})`;
    });

    this.linksLayer
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    if (this.selected) {
      this.emit('node.tick', this.selected);
    }
  }

  onDragStarted(datum) {
    console.log('ondragstarted', datum.id);
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    datum.fx = datum.x;
    datum.fy = datum.y;
    this.stopSimulation();
  }

  onDragged(datum) {
    console.log(this.height);
    datum.fx = d3.event.x;
    datum.fy = d3.event.y;
  }

  onDragEnded(datum) {
    console.log('ondragended', datum.id);
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    if (this.fixAfterDrag) {
      datum.fixed = true;
      datum.fx = d3.event.x;
      datum.fy = d3.event.y;
    } else {
      datum.fx = null;
      datum.fy = null;
    }
    // if autostop
    this.stopSimulation();
  }

  // normally called by this.update
  draw() {
    // I know I know...
    const self = this;

    console.log('draw nodes:', this.nodes.length);

    this.nodesLayer = this.nodesLayer.data(this.nodes, this.identity);
    this.nodesLayer.exit().remove();
    this.nodesLayer = this.nodesLayer.enter().append('g')
      .attr('class', d => d.type)
      .call(d3.drag()
        .on('start', datum => this.onDragStarted(datum))
        .on('drag', datum => this.onDragged(datum))
        .on('end', datum => this.onDragEnded(datum)));

    this.nodesLayer
      .on('mouseenter', function (datum) {
        d3.select(this).raise();
        self.emit('node.mouseenter', datum);
      })
      .on('mouseleave', (datum) => {
        this.emit('node.mouseleave', datum);
      })
      .on('click', (datum) => {
        d3.event.stopPropagation();
        self.selected = datum;
        self.emit('node.click', datum);
      });

    this.nodesLayer.append('circle')
      .classed('n', true);

    this.nodesLayer.append('circle')
        .attr('class', 'whoosh')
        .attr('r', 2);

    // add text
    this.nodesLayer.append('text')
      .attr('dx', 25)
      .attr('dy', '.35em')
      .text(this.nodeLabel);

    this.linksLayer = this.linksLayer.data(this.links); // , d => `${d.source.id}-${d.target.id}`);
    this.linksLayer.exit().remove();
    this.linksLayer = this.linksLayer.enter()
      .append('line');

    // Update and restart the simulation.
    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
    this.simulation.nodes(this.nodes);
    this.simulation.force('link').links(this.links);

    this.simulation.restart();
    this.stopSimulation();
    this.applyDimensions();
  }

  update({
    links = [],
    nodes = [],
  } = {}) {
    console.log('graph update. links:', links.length, 'nodes', nodes.length);
    this.links = links;
    // make sure it has all the required properties
    this.nodes = nodes.map(d => ({
      ...d,
      r: d.r || this.maxNodeRadius,
      type: d.type || 'n',
    }));

    this.updateDimension({
      name: 'linkDistance',
      property: 'w',
      values: this.links,
    });

    this.draw();
  }
  //
  // setDimension(key, dimension) {
  //
  //   console.log('setDimension', name, property, this);
  //   this.draw();
  // }

  /**
   * Set this.with and this.height;
   * then resize svg container.
   * using the given margin
   * @return {null}
   */
  resize() {
    const svgDimensions = this.svg.node().getBoundingClientRect();
    this.width = +svgDimensions.width - this.margin.left;
    this.height = +svgDimensions.height - this.margin.bottom;
    // set svg properties
    this.svg
      .attr('width', this.width)
      .attr('height', this.height);
  }

  /**
   * Stop running simulation after `this.delay` milliseconds.
   * @return {null} [description]
   */
  stopSimulation() {
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
    }
    console.log('stopSimulation: count down...', this.delay);
    this.simulationTimer = setTimeout(() => {
      console.log('stopSimulation: stopped after', this.delay);
      this.simulation.stop();
    }, this.delay);
  }

}
