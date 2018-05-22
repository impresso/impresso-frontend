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
    // console.log('data goes here', this.data);

    d3.select('#overlay-left').html('<h3>relevant entities<br>on current page</h3>');

    const entities = d3.select('#overlay-left');

    entities.selectAll('div.entity').data(this.data.entities).enter()
      .append('div')
      .attr('class', 'entity')
      .append('div')
      .attr('class', 'entity-title')
      .html(d => d.name);

    entities.data(this.data.entities).selectAll('div.entity')
      .append('div')
      .attr('class', 'entity-description')
      .html(d => `${d.labels} (df:${d.df})`);
      // .html(d => d.df);
        // .html(
        //   `
        //    <div class="entity-title">${(d => d.name)}</div>
        //    <div class="entity-description">short description df (${d => d.df})</div>
        //    <br><br><br>`);

    // entities.
    //
    //   .append('div')
    //   .data(this.data.entities)
    //   .enter()
    //   .append()
    //   .html(
    //     `<h3>relevant entities<br>on current page</h3>
    //      <div class="entity-title">${this.data.entities[0].labels[0].name}</div>
    //      <div class="entity-description">short description df (${this.data.entities[0].df})</div>
    //      <br><br><br>`);

    // d3.select('#overlay-left')
    //   .append('div')
    //   .html(
    //    `<h3>all articles<br>on current page</h3>
    //     <div class="entity-title">${this.data.articles[0].title}</div>
    //     <div class="entity-description">short description df (${this.data.articles[0].dl})</div>
    //     <br>`);
  }
}

export default ViewerOverlay;
