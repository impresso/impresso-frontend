/* eslint no-console: 0 */
import * as d3 from 'd3';
import {
  chunk,
} from './common';

class ViewerOverlay {

  constructor(viewer) {
    this.viewer = viewer;
    this.data = {};
    this.zoom = 1;
    this.overlayLeft = null; // d3 selection
    this.overlayRegions = null; // d3 selection
    this.overlayLeftWidth = 600; // int in pixels
  }

  updateZoomLevel(zoom) {
    this.zoom = zoom;
    this.scaleOverlays();
  }

  scaleOverlays() {
    let zoom = this.zoom;

    if (this.viewer.world.getItemAt(0)) {
      zoom = this.viewer.world.getItemAt(0).viewportToImageZoom(this.zoom);
    }

    if (this.overlayLeft) {
      this.overlayLeft.style('transform', `scale(${zoom})`);
    }

    if (this.overlayRegions) {
      this.overlayRegions.regions
      // .style('transform', `scale(${zoom})`)
      .style('top', d => `${d[0] * zoom}px`)
      .style('left', d => `${d[1] * zoom}px`)
      .style('width', d => `${d[2] * zoom}px`)
      .style('height', d => `${d[3] * zoom}px`);
    }
  }

  updateOverlayLeft() {
    const overlayLeft = document.createElement('div');
    overlayLeft.setAttribute('id', 'overlay-left');

    this.viewer.addOverlay({
      x: 0,
      y: 0,
      element: overlayLeft,
    });

    this.overlayLeft = d3.select(overlayLeft)
      .append('div')
      .style('width', `${this.overlayLeftWidth}px`)
      .style('transform-origin', 'top left');

    const entities = this.overlayLeft.append('div')
      .classed('entities', 1)
      .style('transform', `translateX(-${this.overlayLeftWidth}px)`);

    entities.html('<h3>relevant entities<br>on current page</h3>');

    const entity = entities.selectAll('div.entity')
      .data(this.data.entities)
      .enter()
      .append('div')
      .classed('entity', 1);

    entity.append('div')
      .attr('class', 'title')
      .html(d => d.name);

    entity.append('div')
      .attr('class', 'description')
      .html(d => `${d.labels} (df:${d.df})`);
  }

  updateOverlayRegions() {
    const overlayRegions = document.createElement('div');
    overlayRegions.setAttribute('id', 'overlay-regions');

    this.viewer.addOverlay({
      element: overlayRegions,
    });

    this.overlayRegions = d3.select(overlayRegions)
      .append('div')
      .style('transform-origin', 'top left');

    this.overlayRegions.regions = this.overlayRegions.selectAll('div.regions')
      .data(this.data.regions.map((d) => {
        if (d.regions) {
          d.regions = chunk(d.regions);
        } else {
          d.regions = [];
        }
        return d;
      })).enter()
      .append('div')
      .attr('data-uid', d => d.article_uid)
      .classed('regions', true)
      .selectAll('div.region')
      .data(d => d.regions)
      .enter()
      .append('div')
      .classed('region', true)
      .style('position', 'absolute');
  }

  update(data) {
    this.data = data;
    this.updateOverlayLeft();
    this.updateOverlayRegions();

    this.scaleOverlays();
  }
}

export default ViewerOverlay;
