import * as contexts from './Contexts'
import type { Entity, Filter as IFilter } from '.'

export default class Filter implements IFilter {
  q?: string[] | string
  type: string
  context?: string
  precision?: string
  op?: string

  items?: Entity[]
  touched: boolean

  constructor({
    q = '',
    context = contexts.INCLUDE,
    type,
    touched = false
  }: IFilter & { touched?: boolean }) {
    if (this.getQuery === undefined && typeof this.getQuery !== 'function') {
      throw new TypeError('Subclass must implement getQuery() method')
    }
    if (context !== contexts.INCLUDE) {
      this.context = String(contexts[context.toUpperCase()])
    } else {
      this.context = contexts.INCLUDE
    }
    this.type = String(type)
    this.touched = touched
    this.q = String(q)
  }

  getHash() {
    return btoa(JSON.stringify(this.getQuery()))
  }

  getQuery() {
    throw new TypeError(`Filter subclass for ${this.type} must implement getQuery() method`)
  }

  getName() {
    return this.type
  }

  touch() {
    this.touched = true
  }

  untouch() {
    this.touched = false
  }
}
