export default class Partner {
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
