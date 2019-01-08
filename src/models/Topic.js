import TopicWord from '@/models/TopicWord';

export default class Topic {
  constructor({
    excerpt = [],
    language = '',
    model = '',
    uid = '',
    // array of topicWords
    words = [],
  } = {}) {
    this.uid = String(uid);
    this.language = String(language);
    this.model = String(model);
    this.words = words.map(word => new TopicWord(word));
    this.excerpt = excerpt.map(word => new TopicWord(word));
  }
}
