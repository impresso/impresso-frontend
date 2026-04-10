import ArticleTagProperties from './ArticleTagProperties';
/**
 * @class ArticleTag is an object representing a link between an Article and Tag
 * @param {String} articleId UID of the Article
 * @param {Array} properties ArticleTagProperties object
 * @param {String} tagId UID of the Entity
 * @param {String} type String describing the type of link

 */
export default class ArticleTag {
  constructor({
    articleId = '',
    properties = new ArticleTagProperties(),
    tagId = '',
    type = '',
  } = {}) {
    this.articleId = String(articleId);
    this.tagId = String(tagId);

    if (properties instanceof ArticleTagProperties) {
      this.properties = properties;
    } else {
      this.properties = new ArticleTagProperties(properties);
    }

    this.type = String(type);
  }
}
