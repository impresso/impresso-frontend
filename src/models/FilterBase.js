import * as contexts from './Contexts';

export default class Filter {
  constructor({
    context = contexts.INCLUDE,
    type = '',
    touched = false,
  } = {}) {
    this.context = String(contexts[context.toUpperCase()]);
    this.type = String(type);
    this.touched = touched;

    if (this.getQuery === undefined && typeof this.getQuery !== 'function') {
      throw new TypeError('Subclass must implement getQuery() method');
    }
  }

  getName() {
    return this.type;
  }

  touch() {
    this.touched = true;
  }

  untouch() {
    this.touched = false;
  }
}
