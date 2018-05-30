import ArticleTagProperties from './ArticleTagProperties';
/**
 * @class ArticleTag is an object representing a link between an Article and Tag
 * @param {String} articleUid UID of the Article
 * @param {Array} properties ArticleTagProperties object
 * @param {String} tagUid UID of the Entity
 * @param {String} type String describing the type of link

 */
export default function ArticleTag({
  articleUid = '',
  properties = new ArticleTagProperties(),
  tagUid = '',
  type = '',
} = {}) {
  this.articleUid = String(articleUid);
  this.tagUid = String(tagUid);

  if (properties instanceof ArticleTagProperties) {
    this.properties = properties;
  } else {
    this.properties = new ArticleTagProperties({
      creationDate: properties.creation_date,
      creationTime: properties.creation_time,
      creator: properties.creator,
      lastModifiedDate: properties.last_modified_date,
      lastModifiedTime: properties.last_modified_time,
    });
  }

  this.type = String(type);
}
