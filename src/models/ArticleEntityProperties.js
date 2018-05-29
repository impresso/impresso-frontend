/**
 * @todo write class description
 * @class ??ArticleEntityProperties is an object??
 * @param {Float} ntf ??Normalized Term Frequency??
 * @param {Array} splitpoints ??Array with integer values??
 * @param {Integer} tf ??Term Frequency??

 */
export default function ArticleEntityProperties({
  ntf = 0,
  splitpoints = [],
  tf = 0,
} = {}) {
  this.ntf = ntf;
  this.splitpoints = splitpoints;
  this.tf = tf;
}
