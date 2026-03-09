import * as contexts from './Contexts'
import type { Entity, FilterWithItems as IFilter } from '.'
import { FilterContext, FilterOperator, FilterPrecision } from 'impresso-jscommons'

export default class Filter<T = Entity> implements IFilter<T> {
  q?: string[] | string
  type: IFilter<T>['type']
  context?: FilterContext
  precision?: FilterPrecision
  op?: FilterOperator

  items?: T[]
  touched: boolean

  constructor({
    q = '',
    context = contexts.INCLUDE,
    type,
    touched = false
  }: IFilter<T> & { touched?: boolean }) {
    if (this.getQuery === undefined && typeof this.getQuery !== 'function') {
      throw new TypeError('Subclass must implement getQuery() method')
    }
    if (context !== contexts.INCLUDE) {
      this.context = contexts[context.toUpperCase()]
    } else {
      this.context = contexts.INCLUDE
    }
    this.type = type
    this.touched = touched
    this.q = String(q)
  }

  getHash() {
    return btoa(JSON.stringify(this.getQuery()))
  }

  getQuery() {
    throw new TypeError(`Filter subclass for ${this.type} must implement getQuery() method`)
  }

  getName(): string {
    return this.type
  }

  touch() {
    this.touched = true
  }

  untouch() {
    this.touched = false
  }
}
