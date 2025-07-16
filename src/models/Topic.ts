import * as d3 from 'd3'
import TopicWord from '@/models/TopicWord'
import type { Entity as IEntity } from '.'

const wordMapper = token => d => {
  if (token) {
    return d.h ? `<span class="h">${d.w.split(token).join(`<b>${token}</b>`)}</span>` : d.w
  }
  return d.h ? `<span class="h">${d.w}</span>` : d.w
}

export default class Topic implements IEntity {
  uid: string
  language: string
  model: string
  words: TopicWord[]
  excerpt: TopicWord[]
  matches: string[]
  countItems: number
  relatedTopics: string[]
  label?: string
  hwp?: number
  highlighted?: TopicWord[]
  htmlExcerpt?: string

  checked?: boolean

  constructor(
    {
      uid = '',
      language = '',
      model = '',
      // array of topicWords
      words = [],
      excerpt = [],
      matches = [],
      relatedTopics = [],
      countItems = -1,
      label = undefined
    } = {},
    { highlight = '', quantizeRange = [0.4, 0.7, 1, 1] } = {}
  ) {
    this.uid = String(uid)
    this.language = String(language)
    this.model = String(model)
    this.words = words.filter(d => d.p > 0.0)
    this.excerpt = excerpt
    if (matches.length) {
      this.matches = matches.map(d => d.trim().split(' ')).reduce((acc, d) => acc.concat(d), [])
    } else {
      this.matches = matches
    }
    this.countItems = countItems
    this.relatedTopics = relatedTopics
    this.label = label
    if (words.length) {
      const normalize = d3
        .scaleQuantize()
        .domain(d3.extent(this.words, d => d.p))
        .range(quantizeRange)

      this.words = this.words.map(
        d =>
          new TopicWord({
            ...d,
            l: normalize(d.p)
          })
      )
      this.excerpt = this.excerpt.map(d => new TopicWord(d))
      this.hwp = words[0].p

      if (highlight.length > 0) {
        for (let i = 0, l = this.excerpt.length; i < l; i += 1) {
          if (this.excerpt[i].w.indexOf(highlight) !== -1) {
            this.excerpt[i].h = true
          }
        }
        const highlighted = []
        for (let i = this.excerpt.length, l = this.words.length; i < l; i += 1) {
          if (this.words[i].w.indexOf(highlight) !== -1) {
            this.words[i].h = true
            highlighted.push(this.words[i])
          }
        }
        this.highlighted = highlighted
      }

      if (this.excerpt.length) {
        this.htmlExcerpt = this.getHtmlExcerpt()
      }
    }
    if (label != undefined) {
      this.htmlExcerpt = this.getHtmlExcerpt()
    }
  }

  getHtmlExcerpt({ token = null } = {}) {
    if (this.label != undefined) {
      return this.label
    }

    if (this.matches.length) {
      // highlight match in excerpt?
      const justwords = this.matches
        .join(' ')
        .split(/<\/?em>|\s/)
        .filter(d => d.length)
      //
      for (let i = 0, l = this.excerpt.length; i < l; i += 1) {
        if (this.excerpt[i].w === justwords[0]) {
          return this.excerpt
            .slice(0, i)
            .map(d => d.w)
            .concat(this.matches)
            .slice(0, 5)
            .join(' · ')
        }
      }
    }

    let ex = this.excerpt.map(wordMapper(token)).join(' · ')
    if (this.highlighted) {
      ex = `${ex} ... ${this.highlighted.map(wordMapper(token)).join(' · ')}`
    }
    return ex
  }
}
