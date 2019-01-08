
export default class TopicWord {
  constructor({
    w = '',
    p = 0.0,
    l = 0.0,
  } = {}) {
    this.w = String(w);
    this.p = parseFloat(p);
    this.l = parseFloat(l);
  }
}
