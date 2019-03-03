import Topic from './Topic';
/**
 * All properties of this class are optional, since it depends where
 * it is used: e.g. in the list of topics connected to an Article,
 * we won't have any `articleUid` or `article` item attached to ArticleTopic.
 *
 * @class ArticleTopic is an object representing a link between an Article and Topic
 * @param {Article} article Article instance, if any
 * @param {String} articleUid UID of the Article, if any
 * @param {Topic} topic Topic instance, if any
 * @param {String} topicUid UID of the Topic, if Any
 */
export default class ArticleTopic {
  constructor({
    article = null,
    articleUid = '',
    topic = null,
    topicUid = '',
    relevance = 0.0,
  } = {}) {
    if (article) {
      this.article = article;
    }
    if (articleUid) {
      this.articleUid = String(articleUid);
    }
    if (topic) {
      this.topic = topic instanceof Topic ? topic : new Topic(topic);
    }
    if (topicUid) {
      this.topicUid = String(topicUid);
    }
    this.relevance = parseFloat(relevance);
  }
}
