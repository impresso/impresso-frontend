import * as d3 from 'd3'
import TopicWord from '@/models/TopicWord'
import type { Entity as IEntity } from '.'
import type { CachedTopic } from '@/models/generated/app/cache'

export interface RelatedTopic {
  id: string
  w: number
  avg?: number
}

/**
 * Data shape accepted by the Topic constructor. It is the cached/public topic
 * payload plus the search-only `matches` and the frontend-derived `excerpt`.
 */
export type TopicPayload = Omit<Partial<CachedTopic>, 'words'> & {
  words?: Array<Partial<TopicWord> & { w?: string; p?: number }>
  excerpt?: TopicWord[]
  matches?: string[]
}

const wordMapper = token => d => {
  if (token) {
    return d.h ? `<span class="h">${d.w.split(token).join(`<b>${token}</b>`)}</span>` : d.w
  }
  return d.h ? `<span class="h">${d.w}</span>` : d.w
}

export default class Topic implements Partial<CachedTopic>, IEntity {
  id: string
  language: string
  model: string
  words: TopicWord[]
  excerpt: TopicWord[]
  matches: string[]
  contentItemsCount: number
  relatedTopics: RelatedTopic[]
  relatedTopicsStats?: CachedTopic['relatedTopicsStats']
  label: string
  longLabel?: string
  topicNumber?: number
  description?: string
  metadata?: string
  category?: string
  confidence?: 'high' | 'medium' | 'low'
  representativeTerms?: string[]
  generatedBy?: string
  degree?: number
  pagerank?: number
  community?: number
  hub?: number
  authority?: number
  x?: number
  y?: number
  hwp?: number
  highlighted?: TopicWord[]
  htmlExcerpt?: string

  checked?: boolean

  constructor(
    {
      id = '',
      language = '',
      model = '',
      // array of topicWords
      words = [],
      excerpt = [],
      matches = [],
      relatedTopics = [],
      contentItemsCount = -1,
      relatedTopicsStats = undefined,
      label = undefined,
      longLabel = undefined,
      topicNumber = undefined,
      description = undefined,
      metadata = undefined,
      category = undefined,
      confidence = undefined,
      representativeTerms = undefined,
      generatedBy = undefined,
      degree = undefined,
      pagerank = undefined,
      community = undefined,
      hub = undefined,
      authority = undefined,
      x = undefined,
      y = undefined
    }: TopicPayload = {},
    { highlight = '', quantizeRange = [0.4, 0.7, 1, 1] } = {}
  ) {
    this.id = String(id)
    this.language = String(language)
    this.model = String(model)
    this.words = words.filter(d => (d.p ?? 0) > 0.0).map(d => new TopicWord(d))
    this.excerpt = excerpt
    if (matches.length) {
      this.matches = matches.map(d => d.trim().split(' ')).reduce((acc, d) => acc.concat(d), [])
    } else {
      this.matches = matches
    }
    this.contentItemsCount = contentItemsCount
    this.relatedTopics = relatedTopics
    this.relatedTopicsStats = relatedTopicsStats
    this.label = label
    this.longLabel = longLabel
    this.topicNumber = topicNumber
    this.description = description
    this.metadata = metadata
    this.category = category
    this.confidence = confidence
    this.representativeTerms = representativeTerms
    this.generatedBy = generatedBy
    this.degree = degree
    this.pagerank = pagerank
    this.community = community
    this.hub = hub
    this.authority = authority
    this.x = x
    this.y = y
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
    if (this.label || this.longLabel) {
      this.htmlExcerpt = this.getHtmlExcerpt()
    }
  }

  getHtmlExcerpt({ token = null } = {}) {
    const label = this.label || this.longLabel || ''
    if (label !== '') {
      return label
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
