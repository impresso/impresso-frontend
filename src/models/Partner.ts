import type { Entity as IEntity } from '.'

interface PartnerFacet {
  id: string
  title: string
  url?: string
}

export const fromPartnerFacet = (facet?: PartnerFacet) => {
  if (!facet) return undefined
  return new Partner({
    uid: facet.id,
    name: facet.title,
    links: facet.url ? [facet.url] : []
  })
}

export default class Partner implements IEntity {
  uid: string
  name: string
  links: string[]
  url?: string

  constructor({ uid = '', name = '', links = [] } = {}) {
    this.uid = uid
    this.name = name
    this.links = links
    if (this.links.length) {
      this.url = this.links[0]
    }
  }

  toHtml() {
    if (!this.url) {
      return this.name
    }
    return `<a href="${this.url}">${this.name}</a>`
  }
}
