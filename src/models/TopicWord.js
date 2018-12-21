export default class TopicWord {
  constructor({
    w = '',
    p = 0.0,
    l = 0,
  } = {}) {
    this.w = String(w);
    this.l = parseInt(l, 10);
    this.p = parseFloat(p);
  }
}
