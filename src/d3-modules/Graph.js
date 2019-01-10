import * as d3 from 'd3';
import EventEmitter from 'events';


export default class Graph extends EventEmitter {
  constructor({
    element = null,
    margin = {
      top: 10,
      bottom: 10,
      left: 10,
    },
    nodeRadius = 6,
    delay = 15000,
    nodeLabel = d => d.id,
  } = {}) {
    super();

    this.svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'none');

    this.margin = margin;
    this.nodeRadius = parseInt(nodeRadius, 10);
    this.delay = parseInt(delay, 10);

    this.nodeLabel = nodeLabel;
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
      .force('link', d3.forceLink()
        // .id(d => d.id)
        .distance(120))
      .force('center', d3.forceCenter(
        this.width / 2,
        this.height / 2))
      .force('charge', d3.forceManyBody()
        .distanceMin(this.nodeRadius))
      .alphaTarget(0.5)
      .on('tick', () => this.tick());

    console.log('init ...');
    this.stopSimulation();
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
    console.log(this.nodes);
    datum.fx = d3.event.x;
    datum.fy = d3.event.y;
  }

  onDragEnded(datum) {
    console.log('ondragended', datum.id);
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    // if autostop
    datum.fx = null;
    datum.fy = null;
    this.stopSimulation();
  }

  // normally called by this.update
  draw() {
    console.log('draw', this.nodes);

    this.nodesLayer = this.nodesLayer.data(this.nodes);
    this.nodesLayer.exit().remove();
    this.nodesLayer = this.nodesLayer.enter().append('g')
      .attr('class', d => d.type)
      .call(d3.drag()
        .on('start', datum => this.onDragStarted(datum))
        .on('drag', datum => this.onDragged(datum))
        .on('end', datum => this.onDragEnded(datum)));

    // add text
    this.nodesLayer.append('text')
      .attr('dx', 25)
      .attr('dy', '.35em')
      .text(this.nodeLabel);

    this.nodesLayer.append('circle')
      .attr('r', d => d.r)
      .on('mouseenter', (datum) => {
        this.emit('node.mouseenter', datum);
      })
      .on('mouseleave', (datum) => {
        this.emit('node.mouseleave', datum);
      });


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
  }

  update({
    links = [],
    nodes = [],
  } = {}) {
    console.log('graph.update', links, nodes);
    this.links = links;
    // make sure it has all the required properties
    this.nodes = nodes.map(d => ({
      ...d,
      r: d.r || this.nodeRadius,
      type: d.type || 'n',
    }));
    this.draw();
  }

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
