import type { Entity as IEntity } from '.'
/**
 * Entity is an object representing a Named Entity (NE) such as a location or person
 */

interface EntityConstructorParams {
  id?: string
  name?: string
  label?: string
  type?: string
  wikidataId?: string
  dbpediaURL?: string
  impressoId?: string
  countItems?: number | string
  countMentions?: number | string
  wikidata?: any[]
  matches?: string[]
  relevance?: number
}

export default class Entity implements IEntity {
  id: string
  label: string
  name: string
  type: string
  countMentions: number
  countItems: number
  wikidataId: string
  dbpediaURL: string
  impressoId: string
  wikidata: any[]
  relevance: number

  checked?: boolean

  constructor({
    id = '',
    name = '',
    label = '',
    type = 'entity',
    wikidataId = '',
    dbpediaURL = '',
    impressoId = '',
    countItems = -1,
    countMentions = -1,
    wikidata = [],
    matches = [],
    relevance = -1
  }: EntityConstructorParams = {}) {
    this.id = String(id)
    this.name = name
    this.label = label
    this.type = type
    if (matches.length) {
      this.name = matches.join('')
    }
    if (!this.label?.length) {
      this.label = this.name || this.id
    }
    this.countMentions = parseInt(String(countMentions), 10)
    this.countItems = parseInt(String(countItems), 10)
    this.wikidataId = String(wikidataId)
    this.dbpediaURL = String(dbpediaURL)
    this.impressoId = String(impressoId)
    this.wikidata = wikidata
    this.relevance = relevance
  }
}
