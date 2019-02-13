import * as d3 from 'd3';
import TopicWord from '@/models/TopicWord';

export default class Topic {
  constructor({
    uid = '',
    language = '',
    model = '',
    // array of topicWords
    words = [],
    excerpt = [],
  } = {}, {
    quantizeRange = [0.4, 0.7, 1, 1],
  } = {}) {
    this.uid = String(uid);
    this.language = String(language);
    this.model = String(model);
    this.words = words.filter(d => d.p > 0.0);
    this.excerpt = excerpt;

    if (words.length && !(words[0] instanceof TopicWord)) {
      const normalize = d3.scaleQuantize()
        .domain(d3.extent(this.words, d => d.p))
        .range(quantizeRange);

      this.words = this.words.map(d => new TopicWord({
        ...d,
        l: normalize(d.p),
      }));
      this.excerpt = this.excerpt.map(d => new TopicWord(d));
      this.hwp = words[0].p;
    }
  }

  getHtmlExcerpt() {
    return this.excerpt.map(d => d.w).join(' · ');
  }
}
