import ArticleBase from './ArticleBase'

export default class TableOfContents {
  constructor({ articles = [], images = [], newspaper = {} }) {
    this.articles = articles
      .map(d => new ArticleBase(d))
      .filter(d => d.pages.length > 0)
      .sort((a, b) => {
        if (a.pages[0].num === b.pages[0].num) {
          return a.uid.localeCompare(b.uid)
        }
        return a.pages[0].num - b.pages[0].num
      })
    this.images = images
    this.newspaper = {
      id: newspaper.uid,
      type: 'newspaper'
    }
  }
}
