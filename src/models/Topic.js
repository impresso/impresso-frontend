import TopicWord from '@/models/TopicWord';

export default class Topic {
  constructor({
    uid = '',
    language = '',
    model = '',
    // array of topicWords
    words = [],
    excerpt = [],
  } = {}) {
    this.uid = String(uid);
    this.language = String(language);
    this.model = String(model);
    this.words = words;
    this.excerpt = excerpt;

    if (words.length && !(words[0] instanceof TopicWord)) {
      this.words.map(d => new TopicWord(d));
      this.excerpt.map(d => new TopicWord(d));
    }
  }

  getHtmlExcerpt() {
    return this.excerpt.map(d => d.w).join(', ');
  }
}
