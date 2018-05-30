import Article from './Article';
import ArticleEntity from './ArticleEntity';
import Entity from './Entity';
import Region from './Region';
import ArticleTag from './ArticleTag';
import Tag from './Tag';
/**
 * @class Page is an object representing a newspaper page
 * @param {Array} articles Array of Article objects
 * @param {Array} articlesEntities Array of ArticleEntity objects
 * @param {Array} articlesTags Array of ArticleTag objects
 * @param {Array} entities Array of Entity objects
 * @param {Url} iiif Link to iiif resource
 * @param {Array} labels Array of Strings with labels describing the page
 * @param {Integer} num Page number
 * @param {Array} regions Array of ArticleRegions objects
 * @param {Array} tags Array of Tag objects
 * @param {String} uid Unique identifier for the newspaper
 */
export default function Page({
  articles = [],
  articlesEntities = [],
  articlesTags = [],
  entities = [],
  iiif = '',
  labels = ['page'],
  num = 0,
  regions = [],
  tags = [],
  uid = '',
} = {}) {
  this.articles = articles.map(article => new Article({
    uid: article.uid,
    date: article.date,
    labels: article.labels,
    newspaperUid: article.newspaper_uid,
  }));

  this.articlesEntities = articlesEntities.map(articleEntity => new ArticleEntity({
    articleUid: articleEntity.article_uid,
    entityUid: articleEntity.entity_uid,
    properties: articleEntity.properties,
    type: articleEntity.type,
  }));

  this.articlesTags = articlesTags.map(articleTag => new ArticleTag({
    articleUid: articleTag.article_uid,
    tagUid: articleTag.tag_uid,
    properties: articleTag.properties,
    type: articleTag.type,
  }));

  this.entities = entities.map(entity => new Entity({
    df: entity.df,
    labels: entity.labels,
    name: entity.name,
    uid: entity.uid,
  }));

  this.iiif = String(iiif);

  this.labels = labels.map(label => String(label));

  this.num = parseInt(num, 10);

  this.regions = regions.map(region => new Region({
    articleUid: region.article_uid,
    regions: region.regions,
  }));

  this.tags = tags.map(tag => new Tag({
    appliesTo: tag.appliesTo,
    description: tag.description,
    labels: tag.labels,
    name: tag.name,
    uid: tag.uid,
  }));

  this.uid = String(uid);
}
