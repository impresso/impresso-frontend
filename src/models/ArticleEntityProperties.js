/**
 * @todo write class description
 * @class ??ArticleEntityProperties is an object??
 * @param {Float} ntf ??Normalized Term Frequency??
 * @param {Array} splitpoints ??Array with integer values??
 * @param {Integer} tf ??Term Frequency??

 */
export default class ArticleEntityProperties {
  constructor({
    ntf = 0,
    splitpoints = [],
    tf = 0,
  } = {}) {
    this.ntf = parseFloat(ntf);
    this.splitpoints = splitpoints.map(splitpoint => parseInt(splitpoint, 10));
    this.tf = parseInt(tf, 10);
  }
}
