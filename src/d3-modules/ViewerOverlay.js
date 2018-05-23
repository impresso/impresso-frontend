/* eslint no-console: 0 */
import * as d3 from 'd3';
import { chunk } from './common';

class ViewerOverlay {

  constructor(options) {
    // console.log('ViewerOverlay');
    this.options = options;
    this.data = {};
  }
  init(viewer) {
    console.log('init Viezer overlqy', this.options.page);
    this.viewer = viewer;
    this.pageOverlay = d3.select(this.options.page);
    this.pageOverlay.append('div').classed('ciao', 1);
  }

  update(data) {
    this.data = data;

    // function drawHighlight(d)
    // {
    //   console.log('d: ', d);
    //   const elt = document.createElement('div');
    //   elt.className = "highlight";
    //   const overlay = this.viewer.viewport.imageToViewportRectangle(
    //     Math.random() * 500,
    //     Math.random() * 500,
    //     200 + (Math.random() * 30),
    //     100 + (Math.random() * 30));
    //   this.viewer.addOverlay({
    //         element: elt,
    //         location: overlay,
    //     });
    // }

    console.log('data goes here', chunk([1, 2, 3, 4, 5]), this.data.regions);

    this.pageOverlay.selectAll('div.article-regions')
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
        .classed('article-regions', true)
          .selectAll('div.region')
            .data((d) => {
              console.log('d', d.regions);
              // const elt = document.createElement('div');
              // elt.className = "region";
              // this.viewer.addOverlay({
              //       element: elt,
              //       location: [ d.regions[0], d.regions[1], d.regions[2], d.regions[3], ],
              //   });
              return d.regions;
            })
            .enter()
              .append('div')
              .classed('region', true)
              .style('top', d => `${d[0]}px`)
              .style('left', d => `${d[1]}px`)
              .style('width', d => `${d[2]}px`)
              .style('height', d => `${d[3]}px`);

              // .style('transform', d => {
              //   console.log('region tra!',d)
              //   return `translate(${d[0]}px,${d[1]}px); scaleX(${d[2]}px); scaleY(${d[3]}px);`;
              //
              // })


    d3.select('#overlay-left').html('<h3>relevant entities<br>on current page</h3>');

    const entities = d3.select('#overlay-left');

    entities.selectAll('div.entity').data(this.data.entities).enter()
      // .call(drawHighlight)
      .append('div')
      .attr('class', 'entity')
      .append('div')
      .attr('class', 'entity-title')
      .html(d => d.name);

    entities.data(this.data.entities).selectAll('div.entity')
      .append('div')
      .attr('class', 'entity-description')
      .html(d => `${d.labels} (df:${d.df})`);

    // const articles =
    // this.container.select('').data(this.data.regions).enter()
    // .each( (d) => {
    //   if (d.regions != null) {
    //     console.log('id: ', d.article_uid);
    //     const regions = chunk(d.regions);
    //     console.log('regions: ', regions);
    //
    //     const elt = document.createElement('div');
    //     elt.className = "highlight";
    //     const overlay = viewer.viewport.imageToViewportRectangle(regions[0]);
    //     viewer.addOverlay({
    //           element: elt,
    //           location: overlay,
    //       });
    //   }
//  });
    // .call( (d, i) => {drawHighlight( d.regions )});
      // .append('div')
      // .attr('class', 'article-outline')
      // .attr()
    // const articleHighlights = d3.select('#overlay-left');

    // articles
    // d3.select('#overlay-left').append('div').
    // html('<h3>relevant articles<br>on current page</h3>');
    //
    // entities.selectAll('div.entity').data(this.data.articles).enter()
    //   .append('div')
    //   .attr('class', 'entity')
    //   .append('div')
    //   .attr('class', 'entity-title')
    //   .html(d => d.title);

    // d3.select('#overlay-left')
    //   .append('div')
    //   .html(
    //    `<h3>all articles<br>on current page</h3>
    //     <div class="entity-title">${this.data.articles[0].title}</div>
    //     <div class="entity-description">short description df (${this.data.articles[0].dl})</div>
    //     <br>`);

    // drawArticleOverlay(articleID) {
    //   const art = this.articles.find(x => x.uid === articleID);
    //   console.log(art.title);
    // }
    // clicky(clickToZoom) {
    //   this.viewer.gestureSettingsMouse.clickToZoom = clickToZoom;
    // },
    // drawArticleOverlay() {
    // this.viewer.addOnceHandler('open', () => {
    //   // console.log('OK ----');
    //   const self = this.viewer;
    //   const overlay = this.viewer.svgOverlay();
    //
    //   const articles = d3.select(overlay.node()).append('g').classed('article', true);
    //   const article = articles.selectAll('rect').data(this.articles).enter().append('rect')
    //     .attr('fill', 'rgba(0,0,0,0)')
    //     .attr('stroke', 'black')
    //     .attr('stroke-width', '0.01px')
    //     .attr('opacity', '0.5');
    //
    //   article
    //     .attr('x', d => this.getImageToViewportCoordinates
    // (d.regions.x, 0).x)
    //     .attr('width', d => this.getImageToViewportCoordinates
    // (d.regions.w, 0).x)
    //     .attr('y', d => this.getImageToViewportCoordinates(0, d.regions.y).y)
    //     .attr('height', d => this.getImageToViewportCoordinates(0, d.regions.h).y)
    //     .on('click', function mousedown() {
    //       d3.select(this)
    //         .attr('stroke', 'red');
    //     })
    //     .on('mouseover', function mouseover() {
    //       // d3.event.preventDefault();
    //       self.gestureSettingsMouse.clickToZoom = false;
    //       d3.select(this)
    //         .attr('opacity', '1');
    //     })
    //     .on('mouseout', function mouseout() {
    //       self.gestureSettingsMouse.clickToZoom = true;
    //       d3.select(this)
    //         .attr('opacity', '0.5');
    //     });
    //
      // draw entity highlights
    //   const overlay = this.viewer.svgOverlay();
    //   const highlights = d3.select(overlay.node()).append('g').classed('highlights', true);
    //   const highlight = highlights.selectAll('rect').data(this.namedEntities).enter()
    // .append('rect')
    //     .attr('fill', 'rgba(255,220,0,0.5)')
    //     .attr('stroke-width', '0');
    //
    //   highlight
    //     .attr('x', d => this.getImageToViewportCoordinates(d.boundingBox.x, 0).x)
    //     .attr('width', d => this.getImageToViewportCoordinates(d.boundingBox.w, 0).x)
    //     .attr('y', d => this.getImageToViewportCoordinates(0, d.boundingBox.y).y)
    //     .attr('height', d => this.getImageToViewportCoordinates(0, d.boundingBox.h).y)
    //     .on('click', function mousedown() {
    //       const id = d => d.id;
    //       console.log('clicked', id);
    //       d3.select(this)
    //         .transition()
    //         .ease(d3.easeSin)
    //         .duration(100)
    //         .attr('fill', 'red');
    //     });
    //     .on('mouseover', function mouseover() {
    //       // d3.event.preventDefault();
    //       self.gestureSettingsMouse.clickToZoom = false;
    //       d3.select(this)
    //         .transition()
    //         .ease(d3.easeSin)
    //         .duration(200)
    //         .attr('opacity', '1')
    //         .attr('stroke-width', '0.01px');
    //     })
    //     .on('mouseout', function mouseout() {
    //       self.gestureSettingsMouse.clickToZoom = true;
    //       d3.select(this)
    //         .transition()
    //         .ease(d3.easeSin)
    //         .duration(200)
    //         .attr('opacity', '0.5')
    //         .attr('stroke-width', '.004px');
    //     });
    // });
  }
}

export default ViewerOverlay;
