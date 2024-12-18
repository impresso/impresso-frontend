import * as d3 from 'd3'
import Basic from './Basic'
import Dimension from './Dimension'

export default class Graph extends Basic {
  constructor({
    element = null,
    margin = {
      top: 10,
      bottom: 10,
      left: 10
    },
    maxNodeRadius = 15,
    maxDistance = 100,
    delay = 30000,
    fixAfterDrag = true,
    nodeLabel = d => d.id,
    identity = d => d.id,
    showLabel = d => !!d,
    ignoreLinks = true,
    // override current behaviour if needed,
    dimensions = {}
  } = {}) {
    super({
      element,
      margin,
      dimensions: {
        nodeColor: new Dimension({
          name: 'nodeColor',
          property: 'id',
          type: Dimension.TYPE_DISCRETE,
          scaleFn: d3.scaleOrdinal
        }),
        nodeSize: new Dimension({
          name: 'nodeSize',
          property: 'degree',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleLinear,
          range: [3, maxNodeRadius]
        }),
        linkStrength: new Dimension({
          name: 'linkStrength',
          property: 'w',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleSqrt,
          range: [0.1, 0.15]
        }),
        linkStrokeWidth: new Dimension({
          name: 'linkStrokeWidth',
          property: 'w',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleSqrt,
          range: [1, 10]
        }),
        ...dimensions
      }
    })
    this.svg.on('click', () => {
      this.selected = null
      this.emit('svg.click')
    })

    this.fixAfterDrag = fixAfterDrag
    this.maxNodeRadius = parseInt(maxNodeRadius, 10)
    this.maxDistance = parseInt(maxDistance, 10)
    this.delay = parseInt(delay, 10)
    this.ignoreLinks = ignoreLinks
    this.nodeLabel = nodeLabel
    this.identity = identity
    this.showLabel = showLabel
    // initialize graphic elements
    this.zoomableLayer = this.svg.append('g')

    this.zoomHandler = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', event => {
        this.emit('svg.zoom', event.transform)
        this.zoom(event.transform)
        this.nodesLayer.selectAll('.s').attr('transform', `scale(${1 / event.transform.k})`)
      })

    this.currentTransform = { k: 1, x: 0, y: 0 }

    this.svg.call(this.zoomHandler)

    // init link and node collections
    this.linksLayer = this.zoomableLayer.append('g').classed('links', true).selectAll('line')

    this.nodesLayer = this.zoomableLayer.append('g').classed('nodes', true).selectAll('circle')

    this.linkForce = d3
      .forceLink()
      .distance(maxDistance * 2)
      .strength(this.ignoreLinks ? 0 : this.dimensions.linkStrength.accessor())
    // initialize force!
    this.simulation = d3.forceSimulation()

    this.simulation.force('link', this.linkForce)
    // .force('collide', d3.forceCollide()
    //   .strength(0.7)
    //   .radius(this.maxNodeRadius))
    // .force('charge', d3.forceManyBody()
    //   .strength(-20)
    //   .distanceMin(this.maxNodeRadius)
    //   .distanceMax(this.maxNodeRadius * 10))
    // .force('center', d3.forceCenter(
    //   this.width / 2,
    //   this.height / 2))
    this.simulation.alphaTarget(0.5).on('tick', () => this.tick())

    this.stopSimulation()
  }

  assignClassToSVG(className, { classed = true } = {}) {
    this.svg.classed(className, classed)
  }

  assignClassToNodes(
    nodes,
    className,
    { affectAllNodes = false, assignToLinks = false, classed = true } = {}
  ) {
    if (affectAllNodes) {
      // if nodes is empty, then jsut turn on  /off classes.
      this.nodesLayer.classed(className, classed)
      if (assignToLinks) {
        this.linksLayer.classed(className, classed)
      }
      return
    }
    const ids = nodes.map(this.identity)
    this.nodesLayer.classed(className, node =>
      ids.includes(this.identity(node)) ? classed : !classed
    )
    if (assignToLinks) {
      // get the list of the link ids
      const linksIds = this.links
        .filter(l => ids.includes(l.target.id) || ids.includes(l.source.id))
        .map(({ id }) => id)
      this.linksLayer.classed(className, ({ id }) => (linksIds.includes(id) ? classed : !classed))
    }
  }

  selectNeighbors(node) {
    const linksIds = []
    const neighborsIds = []
    const nodeId = this.identity(node)
    this.links.forEach(link => {
      // nodeId should be in the link id.
      if (link.id.indexOf(nodeId) !== -1) {
        linksIds.push(link.id)
        if (nodeId === link.target.id) {
          neighborsIds.push(link.source.id)
        } else {
          neighborsIds.push(link.target.id)
        }
      }
    })
    this.linksLayer.classed('selected', ({ id }) => linksIds.includes(id))
    this.nodesLayer.classed('selected', d => neighborsIds.includes(this.identity(d)))
  }

  zoomTo(node) {
    const { x, y } = node
    const x0 = x - 100
    const x1 = x + 100
    const y0 = y - 100
    const y1 = y + 100
    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoomHandler.transform,
        d3.zoomIdentity
          .translate(this.width / 2, this.height / 2)
          .scale(this.currentTransform.k)
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
      )
  }

  zoom(transform) {
    if (!transform) {
      this.svg
        .transition()
        .duration(250)
        .call(
          this.zoomHandler.transform,
          d3.zoomIdentity,
          d3.zoomTransform(this.svg.node()).invert([this.width / 2, this.height / 2])
        )
    } else {
      this.currentTransform = transform
      this.zoomableLayer.attr('transform', transform)
    }
  }

  applyDimensions() {
    this.nodesLayer
      .selectAll('.c')
      .transition()
      .attr('fill', d => {
        if (d.disabled) {
          return '#ffffff'
        }
        return this.dimensions.nodeColor.accessor()(d)
      })
      .attr('stroke', d => {
        if (d.disabled) {
          return '#ffffff'
        }
        return this.dimensions.nodeColor.accessor()(d)
      })
      .attr('r', this.dimensions.nodeSize.accessor())

    // apply force
    // this.simulation.force('link')
    // .strength(this.dimensions.linkStrength.accessor());
    // strength(+this.value);
    // this.simulation.alpha(1).restart();
  }

  /**
   * [tick description]
   * @return {null} [description]
   */
  tick() {
    this.nodesLayer.attr('transform', d => {
      d.y = Math.max(d.r, Math.min(this.height - d.r, d.y))
      d.x = Math.max(d.r, Math.min(this.width - d.r, d.x))
      return `translate(${d.x},${d.y})`
    })

    this.linksLayer
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    if (this.selected) {
      this.emit('node.tick', this.selected)
    }
  }

  onDragStarted(event) {
    if (!event.active) {
      this.simulation.alphaTarget(0.3).restart()
    }
    event.fx = event.x
    event.fy = event.y
    this.stopSimulation()
    this.selected = event
    // this.emit('node.click', datum);
  }

  onDragged(event) {
    this.dragged = event
    event.fx = event.x
    event.fy = event.y
  }

  onDragEnded(event) {
    if (!event.active) {
      this.simulation.alphaTarget(0)
    }
    if (this.fixAfterDrag) {
      event.fixed = true
      event.fx = event.x
      event.fy = event.y
    } else {
      event.fx = null
      event.fy = null
    }
    // if autostop
    this.stopSimulation()
    //
    // this.nodesLayer.classed('fix', d => d.fixed);
  }

  // normally called by this.update
  draw() {
    const self = this
    this.simulation.stop()
    // Apply the general update pattern to the nodes.
    // It follows https://bl.ocks.org/HarryStevens/bc938c8d45008d99faed47039fbe5d49
    this.nodesLayer = this.nodesLayer.data(this.nodes, this.identity)
    this.nodesLayer.exit().remove()

    const nodesEnter = this.nodesLayer
      .enter()
      .append('g')
      .attr('class', d => {
        if (self.showLabel(d)) {
          return `${d.type} v`
        }
        return `${d.type} o`
      })
      .call(
        d3
          .drag()
          .on('start', (...args) => this.onDragStarted(...args))
          .on('drag', (...args) => this.onDragged(...args))
          .on('end', (...args) => this.onDragEnded(...args))
      )
    // .merge(this.nodesLayer);
    const scalableNodesEnter = nodesEnter.append('g').classed('s', true)
    scalableNodesEnter.append('circle').classed('c', true)

    scalableNodesEnter.append('circle').attr('class', 'whoosh').attr('r', 1)

    // add text
    scalableNodesEnter
      .append('text')
      .attr('dx', d => d.r + 5)
      .attr('dy', '.25em')
      .text(this.nodeLabel)

    // merge
    this.nodesLayer = this.nodesLayer.merge(nodesEnter)
    this.nodesLayer
      .on('mouseenter', function onMouseEnter(event, datum) {
        d3.select(this).raise()
        self.emit('node.mouseenter', datum)
      })
      .on('mouseleave', (event, datum) => {
        this.emit('node.mouseleave', datum)
      })
      .on('click', (event, datum) => {
        event.stopPropagation()
        self.selected = datum
        self.emit('node.click', datum)
      })

    this.linksLayer = this.linksLayer.data(this.links) // , d => `${d.source.id}-${d.target.id}`);
    this.linksLayer.exit().remove()

    const linksEnter = this.linksLayer
      .enter()
      .append('line')
      .attr('stroke-width', this.dimensions.linkStrokeWidth.accessor())

    this.linksLayer = this.linksLayer.merge(linksEnter)
    this.linksLayer
      .on('mouseenter', (event, datum) => {
        this.emit('link.mouseenter', datum)
      })
      .on('mouseleave', (event, datum) => {
        this.emit('link.mouseleave', datum)
      })
      .on('click', (event, datum) => {
        event.stopPropagation()
        self.selected = datum
        self.emit('link.click', datum)
      })
    // Update and restart the simulation.
    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2))
    this.simulation.nodes(this.nodes)
    this.simulation.force('link').links(this.links)
    this.applyDimensions()

    this.simulation.alphaTarget(0.5).restart()
    this.stopSimulation()
  }

  update({ links, nodes, pristine = false }) {
    // make sure it has all the required properties
    if (nodes && Array.isArray(nodes)) {
      if (!pristine && this.nodes && this.nodes.length) {
        const nodesIds = this.nodes.map(d => d.id)
        this.nodes = nodes.map(d => {
          const idx = nodesIds.indexOf(d.id)
          const node = {
            ...d,
            r: d.r || this.maxNodeRadius,
            type: d.type || 'n'
          }
          if (idx > -1) {
            Object.assign(node, {
              vx: +this.nodes[idx].vx,
              vy: +this.nodes[idx].vy,
              x: +this.nodes[idx].x,
              y: +this.nodes[idx].y
            })
          }
          return node
        })
      } else {
        this.nodes = nodes.map(d => ({
          ...d,
          r: d.r || this.maxNodeRadius,
          type: d.type || 'n'
        }))
      }
    }
    if (links) {
      this.links = links.map(d => ({
        ...d,
        a: true
      }))
      this.updateDimension({
        name: 'linkStrength',
        property: 'w',
        values: this.links
      })

      this.updateDimension({
        name: 'linkStrokeWidth',
        property: 'w',
        values: this.links
      })
    }

    if (links || nodes) {
      this.draw()
    }
  }
  /**
   * Stop running simulation after `this.delay` milliseconds.
   * @return {null} [description]
   */
  stopSimulation() {
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer)
    }
    this.simulationTimer = setTimeout(() => {
      this.simulation.stop()
    }, this.delay)
  }

  // resize() {
  //   super.resize();
  //   this.zoomableLayer
  //     .attr('width', this.width)
  //     .attr('height', this.height);
  // }
}
