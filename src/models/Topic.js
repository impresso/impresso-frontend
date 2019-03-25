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
    highlight = '',
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

      if (highlight.length > 0) {
        for (let i = 0, l = this.excerpt.length; i < l; i += 1) {
          if (this.excerpt[i].w.indexOf(highlight) !== -1) {
            this.excerpt[i].h = true;
          }
        }
        const highlighted = [];
        for (let i = this.excerpt.length, l = this.words.length; i < l; i += 1) {
          if (this.words[i].w.indexOf(highlight) !== -1) {
            this.words[i].h = true;
            highlighted.push(this.words[i]);
          }
        }
        this.highlighted = highlighted;
      }
    }
  }

  getHtmlExcerpt({
    token = null,
  } = {}) {
    const wordMapper = (d) => {
      if (token) {
        return (d.h ? `<span class="h">${d.w.split(token).join(`<b>${token}</b>`)}</span>` : d.w);
      }
      return (d.h ? `<span class="h">${d.w}</span>` : d.w);
    };

    let ex = this.excerpt.map(wordMapper).join(' · ');
    if (this.highlighted) {
      ex = `${ex} ... ${this.highlighted.map(wordMapper).join(' · ')}`;
    }
    return ex;
  }
}
