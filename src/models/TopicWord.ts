export default class TopicWord {
  w: string
  p: number
  l: number
  h: boolean

  constructor({ w = '', p = 0.0, l = 0.0, h = false } = {}) {
    this.w = String(w)
    this.p = Number(p)
    this.l = Number(l)
    this.h = Boolean(h)
  }
}
