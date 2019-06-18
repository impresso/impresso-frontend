export default class Mention {
  constructor({
    frequence = 0,
    name = '',
    type = '',
    t = '',
    l = 0,
    r = 0,
    confidence = '',
    firstname = '',
    surname = '',
    fn = '',
    title = '',
    qualifier = '',
    demonym = '',
  } = {}) {
    this.frequence = parseInt(frequence, 10);
    this.name = String(name);
    this.type = String(type);
    this.t = String(t);
    this.l = parseInt(l, 10);
    this.r = parseInt(r, 10);
    this.confidence = String(confidence);
    this.firstname = String(firstname);
    this.surname = String(surname);
    this.fn = String(fn);
    this.title = String(title);
    this.qualifier = String(qualifier);
    this.demonym = String(demonym);
  }
}
