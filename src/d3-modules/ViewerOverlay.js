/* eslint no-console: 0 */
import * as d3 from 'd3';
import Page from '@/models/Page';

class ViewerOverlay {

  constructor(viewer) {
    this.viewer = viewer;
    this.data = {};
    this.page = new Page();
    this.zoom = 0;
    this.overlayLeft = null; // d3 selection
    this.overlayRight = null; // d3 selection
    this.overlayRegions = null; // d3 selection
    this.overlayLeftWidth = 600; // int in pixels
    this.overlayRightWidth = 200; // int in pixels
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
        .style('left', d => `${d.left * zoom}px`)
        .style('top', d => `${d.top * zoom}px`)
        .style('width', d => `${d.width * zoom}px`)
        .style('height', d => `${d.height * zoom}px`);
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
      .style('transform-origin', 'top left')
      .classed('loading', true)
      .classed('loaded', false);

    const entities = this.overlayLeft.append('div')
      .classed('entities', 1)
      .style('transform', `translateX(-${this.overlayLeftWidth}px)`);

    const entity = entities.selectAll('div.entity')
      .data(this.page.entities)
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

  //
  // tag overlay
  //
  updateOverlayRight() {
    const overlayRight = document.createElement('div');
    overlayRight.setAttribute('id', 'overlay-right');

    this.viewer.addOverlay({
      x: 1,
      y: 0,
      element: overlayRight,
    });

    this.overlayRight = d3.select(overlayRight)
      .append('div')
      .style('width', `${this.overlayRightWidth}px`)
      .style('transform-origin', 'top right')
      .classed('loading', true)
      .classed('loaded', false);

    const entities = this.overlayRight.append('div')
      .classed('entities', 1);

    const entity = entities.selectAll('div.entity')
      .data(this.page.tags)
      .enter()
      .append('div')
      .classed('entity', 1);

    entity.append('div')
      .attr('class', 'title')
      .html(d => d.name);

    entity.append('div')
      .attr('class', 'description')
      .html(d => `${d.description}`);
  }

  //
  // article regions
  //
  updateOverlayRegions() {
    const overlayRegions = document.createElement('div');
    overlayRegions.setAttribute('id', 'overlay-regions');

    this.viewer.addOverlay({
      element: overlayRegions,
    });

    this.overlayRegions = d3.select(overlayRegions)
      .append('div')
      .style('transform-origin', 'top left')
      .classed('loading', true)
      .classed('loaded', false);

    this.overlayRegions.regions = this.overlayRegions.selectAll('div.regions')
      .data(this.page.regions).enter()
      .append('div')
      .attr('data-uid', d => d.article_uid)
      .classed('regions', true)
      .selectAll('div.region')
      .data(d => d.regions)
      .enter()
      .append('div')
      .classed('region', true)
      .style('position', 'absolute');


    // ///////

    function handleRegionClick(article) {
      console.log('active:', article.uid, ` (${article.title})`);
      // d3.select('.action-overlay').remove();
      // d3.select('body')
      //   .append('div')
      //   .classed('action-overlay', true)
      //   .style('left', `${d3.event.pageX}px`)
      //   .style('top', `${d3.event.pageY + 10}px`)
      //   .html(`${article.title}`);
      d3.select('body').selectAll('.active').classed('active', false);
      d3.select(this).classed('active', true);
    }

    function handleRegionEnter() {
      d3.select(this).classed('highlight', true);
      d3.select('.action-overlay').remove();
    }

    function handleRegionLeave() {
      d3.select(this).classed('highlight', false);
    }

    this.overlayRegions.articles = this.overlayRegions.selectAll('div.articleOverlay')
      .data(this.page.articles)
      .enter()
      .append('div')
      .attr('title', d => d.title)
      .attr('class', d => d.labels.join(' '))
      .classed('articleOverlay', true)
      .on('click', handleRegionClick)
      .on('mouseenter', handleRegionEnter)
      .on('mouseleave', handleRegionLeave);

    this.overlayRegions.regions = this.overlayRegions.articles.selectAll('div.region')
      .data((article) => {
        article.regions = this.page.regions
          .filter(region => region.articleUid === article.uid)
          .reduce((arr, d) => arr.concat(d.regions), []);
        // console.log('hey', article.uid, article.regions);
        return article.regions;
      })
      .enter()
      .append('div')
      .classed('region', true);
  }

  update(page) {
    this.page = page;
    this.updateOverlayLeft();
    this.updateOverlayRight();
    this.updateOverlayRegions();

    this.scaleOverlays();

    this.overlayLeft.classed('loading', false).classed('loaded', true);
    this.overlayRight.classed('loading', false).classed('loaded', true);
    this.overlayRegions.classed('loading', false).classed('loaded', true);
  }
}

export default ViewerOverlay;
