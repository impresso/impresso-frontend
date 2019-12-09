import ContentItem from './ContentItem';

export default class Image extends ContentItem {
  constructor(options) {
    super(options);
    if (options.article) {
      this.article = {
        uid: options.article,
      };
    }
  }
}
