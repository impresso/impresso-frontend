import ArticleEntityProperties from './ArticleEntityProperties';
/**
 * @class ArticleEntity is an object representing a link between an Article and Entity
 * @param {String} articleUid UID of the Article
 * @param {String} entityUid UID of the Entity
 * @param {ArticleEntityProperties} properties ArticleEntityProperties object
 * @param {String} type String describing the type of link

 */
export default class ArticleEntity {
  constructor({
    articleUid = '',
    entityUid = '',
    properties = new ArticleEntityProperties(),
    type = '',
  } = {}) {
    this.articleUid = String(articleUid);
    this.entityUid = String(entityUid);

    if (properties instanceof ArticleEntityProperties) {
      this.properties = properties;
    } else {
      this.properties = new ArticleEntityProperties(properties);
    }

    this.type = String(type);
  }
}
