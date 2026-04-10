import ArticleEntityProperties from './ArticleEntityProperties';
/**
 * @class ArticleEntity is an object representing a link between an Article and Entity
 * @param {String} articleId UID of the Article
 * @param {String} entityId UID of the Entity
 * @param {ArticleEntityProperties} properties ArticleEntityProperties object
 * @param {String} type String describing the type of link

 */
export default class ArticleEntity {
  constructor({
    articleId = '',
    entityId = '',
    properties = new ArticleEntityProperties(),
    type = '',
  } = {}) {
    this.articleId = String(articleId);
    this.entityId = String(entityId);

    if (properties instanceof ArticleEntityProperties) {
      this.properties = properties;
    } else {
      this.properties = new ArticleEntityProperties(properties);
    }

    this.type = String(type);
  }
}
