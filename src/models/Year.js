const NUMBER_OF_CONTENTITEMS = 'c';
const NUMBER_OF_ARTICLES = 'a';
// const NUMBER_OF_PAGES = 'p';
// const NUMBER_OF_ISSUES = 'i';
const NUMBER_OF_IMAGES = 'm';

export default class Year {
  constructor({
    y,
    refs = null,
  } = {}) {
    this.y = y;
    this.refs = refs;
  }

  /**
    * Normalize a given value against a specific value in refs.
    * @param  {float} value                      value to normalize
    * @param  {String} [k=NUMBER_OF_CONTENTITEMS] [description]
    * @return {float}                            normalized values
    */
  normalize(value, k = NUMBER_OF_CONTENTITEMS) {
    if (typeof this.refs[k] === 'undefined' || this.refs[k] === 0) {
      return 0;
    }
    return value / this.refs[k];
  }
}

Year.NUMBER_OF_IMAGES = NUMBER_OF_IMAGES;
Year.NUMBER_OF_CONTENTITEMS = NUMBER_OF_CONTENTITEMS;
Year.NUMBER_OF_ARTICLES = NUMBER_OF_ARTICLES;
