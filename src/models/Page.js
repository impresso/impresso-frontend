// import * as services from '@/services/';
// import Entity from './Entity';
// import ArticleEntity from './ArticleEntity';
// import ArticleEntityProperties from './ArticleEntityProperties';
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
 * @param {Array} tags Array of ArticleTag objects
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
  this.articles = articles;
  this.articlesEntities = articlesEntities;
  this.articlesTags = articlesTags;
  this.entities = entities;
  this.iiif = String(iiif);
  this.labels = labels.map(label => String(label));
  this.num = parseInt(num, 10);
  this.regions = regions;
  this.tags = tags;
  this.uid = String(uid);

  // this.populate = () => {
  //   services.pages.get(this.uid, {}).then((res) => {
  //     console.log(res);
  //     this.articles = res.articles;
  //     this.articlesEntities = res.articles_entities.map(articleEntity => new ArticleEntity({
  //       articleUid: articleEntity.article_uid,
  //       entityUid: articleEntity.entity_uid,
  //       properties: new ArticleEntityProperties({
  //         ntf: articleEntity.properties.ntf,
  //         splitpoints: articleEntity.properties.splitpoints,
  //         tf: articleEntity.properties.tf,
  //       }),
  //       type: articleEntity.type,
  //     }));
  //     this.articlesTags = res.articles_tags;
  //     this.entities = res.entities.map(entity => new Entity({
  //       df: entity.df,
  //       labels: entity.labels,
  //       name: entity.name,
  //       uid: entity.uid,
  //     }));
  //     this.iiif = res.iiif;
  //     this.labels = res.labels;
  //     this.num = res.num;
  //     this.regions = res.regions;
  //     this.tags = res.tags;
  //     this.uid = res.uid;
  //     console.log(this);
  //   },
  //   (err) => {
  //     console.log('error: ', err);
  //   });
  // };
}
