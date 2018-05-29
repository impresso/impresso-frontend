import ArticleEntityProperties from './ArticleEntityProperties';
/**
 * @class ArticleEntity is an object representing a link between an Article and Entity
 * @param {String} articleUid UID of the Article
 * @param {String} entityUid UID of the Entity
 * @param {ArticleEntityProperties} properties ArticleEntityProperties object
 * @param {String} type String describing the type of link

 */
export default function ArticleEntity({
  articleUid = '',
  entityUid = '',
  properties = new ArticleEntityProperties(),
  type = '',
} = {}) {
  this.articleUid = articleUid;
  this.entityUid = entityUid;
  this.properties = properties;
  this.type = type;
}
