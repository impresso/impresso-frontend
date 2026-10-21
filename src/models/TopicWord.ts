import type { TopicWord as CachedTopicWord } from '@/models/generated/app/cache'

export default class TopicWord implements CachedTopicWord {
  w: string
  p: number
  l: number
  h?: boolean

  constructor({ w = '', p = 0.0, l = 0.0, h = false } = {}) {
    this.w = String(w)
    this.p = Number(p)
    this.l = Number(l)
    this.h = Boolean(h)
  }
}
