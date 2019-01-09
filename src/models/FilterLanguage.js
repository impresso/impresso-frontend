import Filter from '@/models/FilterBase';
/**
 * FilterEntity object
 * @param {Object} bucket The bucket
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default class FilterLanguage extends Filter {
  constructor(args) {
    super(args);
    this.language = args.item;
  }

  getQuery() {
    return {
      context: this.context,
      type: this.type,
      q: this.language.uid,
    };
  }
}
