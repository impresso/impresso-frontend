export default class Mention {
  constructor({
    frequence = 0,
    name = '',
    type = '',
  } = {}) {
    this.frequence = parseInt(frequence, 10);
    this.name = String(name);
    this.type = String(type);
  }
}
