export default class Filter {
  constructor({
    context = 'include',
    type = '',
    touched = false,
  } = {}) {
    this.context = String(context);
    this.type = String(type);
    this.touched = touched;

    if (this.getName === undefined && typeof this.getName !== 'function') {
      throw new TypeError('Subclass must implement getName() method');
    }

    if (this.getQuery === undefined && typeof this.getQuery !== 'function') {
      throw new TypeError('Subclass must implement getQuery() method');
    }
  }

  touch() {
    this.touched = true;
  }

  untouch() {
    this.touched = false;
  }
}
