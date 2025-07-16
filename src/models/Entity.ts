import type { Entity as IEntity } from '.'
/**
 * Entity is an object representing a Named Entity (NE) such as a location or person
 */

interface EntityConstructorParams {
  uid?: string
  name?: string
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
  uid: string
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
    uid = '',
    name = '',
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
    this.uid = String(uid)
    this.name = name
    this.type = type
    if (matches.length) {
      this.name = matches.join('')
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
