import ArticleBase from './ArticleBase'

export default class TableOfContents {
  constructor({ articles = [], images = [], newspaper = {} }) {
    this.articles = articles
      .map(d => new ArticleBase(d))
      .sort((a, b) => {
        if (!a.pages[0] || !b.pages[0]) {
          console.warn('[TableOfContents] a.pages[0] or b.pages is undefined', a, b)
          return a.uid.localeCompare(b.uid)
        }
        a.pages[0].num - b.pages[0].num
      })
    this.images = images
    this.newspaper = {
      id: newspaper.uid,
      type: 'newspaper'
    }
  }
}
