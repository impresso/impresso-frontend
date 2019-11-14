import * as d3 from 'd3';
import Basic from './Basic';
import Dimension from './Dimension';

export default class Graph extends Basic {
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
    super({
      element,
      margin,
      dimensions: {
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
          range: [4, maxNodeRadius],
        }),
        linkDistance: new Dimension({
          name: 'linkDistance',
          property: 'w',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleSqrt,
          range: [10, 200],
        }),
        linkWeight: new Dimension({
          name: 'linkWeight',
          property: 'w',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleSqrt,
          range: [1, 10],
        }),
        ...dimensions,
      },
    });

    this.svg.on('click', () => {
      this.selected = null;
      this.emit('svg.click');
    });

    this.fixAfterDrag = fixAfterDrag;
    this.maxNodeRadius = parseInt(maxNodeRadius, 10);
    this.maxDistance = parseInt(maxDistance, 10);
    this.delay = parseInt(delay, 10);

    this.nodeLabel = nodeLabel;
    this.identity = identity;

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
    // this.simulation.alpha(1).restart();
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
    // console.info('ondragstarted', datum.id);
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    datum.fx = datum.x;
    datum.fy = datum.y;
    this.stopSimulation();
    this.selected = datum;
    this.emit('node.click', datum);
  }

  onDragged(datum) {
    // console.info(this.height);
    this.dragged = datum;
    datum.fx = d3.event.x;
    datum.fy = d3.event.y;
  }

  onDragEnded(datum) {
    // console.info('ondragended', datum.id);
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
    //
    this.nodesLayer.classed('fix', d => d.fixed);
  }

  // normally called by this.update
  draw() {
    // I know I know...
    const self = this;

    // console.info('draw nodes:', this.nodes.length);

    this.nodesLayer = this.nodesLayer.data(this.nodes, this.identity);
    this.nodesLayer.exit().remove();
    this.nodesLayer = this.nodesLayer.enter().append('g')
      .attr('class', d => d.type)
      .call(d3.drag()
        .on('start', datum => this.onDragStarted(datum))
        .on('drag', datum => this.onDragged(datum))
        .on('end', datum => this.onDragEnded(datum)));

    this.nodesLayer
      .on('mouseenter', function onMouseEnter(datum) {
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
      .append('line')
      .attr('stroke-width', this.dimensions.linkWeight.accessor());

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
    console.info('graph update. links:', links.length, 'nodes', nodes.length);
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

    this.updateDimension({
      name: 'linkWeight',
      property: 'w',
      values: this.links,
    });

    this.draw();
  }
  //
  // setDimension(key, dimension) {
  //
  //   console.info('setDimension', name, property, this);
  //   this.draw();
  // }

  /**
   * Stop running simulation after `this.delay` milliseconds.
   * @return {null} [description]
   */
  stopSimulation() {
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
    }
    console.info('stopSimulation: count down...', this.delay);
    this.simulationTimer = setTimeout(() => {
      console.info('stopSimulation: stopped after', this.delay);
      this.simulation.stop();
    }, this.delay);
  }
}
