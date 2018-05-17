/* eslint no-console: 0 */
import * as d3 from 'd3';

class ViewerOverlay {

  constructor(options) {
    console.log('ViewerOverlay');
    this.container = d3.select(options.container);
    this.data = {};
  }

  update(data) {
    this.data = data;
    console.log('data goes here', this.data.entities.segments[0].end);
    d3.select('#overlay-left')
      .append('div')
      .html(
        `<h3>relevant entities<br>on current page</h3>
         <div class="entity-title">${this.data.entities.segments[0].end.name}</div>
         <div class="entity-description">short description df (${this.data.entities.segments[0].end.df})</div>
         <br><br><br>`);
    d3.select('#overlay-left')
      .append('div')
      .html(
       `<h3>all articles<br>on current page</h3>
        <div class="entity-title">${this.data.articles[0].title}</div>
        <div class="entity-description">short description df (${this.data.articles[0].dl})</div>
        <br>`);
  }
}

export default ViewerOverlay;
