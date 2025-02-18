import ArticleBase from './ArticleBase'

export default class TableOfContents {
  constructor({ articles = [], images = [], newspaper = {} }) {
    this.articles = articles
      .map(d => new ArticleBase(d))
      .sort((a, b) => a.pages[0].num - b.pages[0].num)
    this.images = images
    this.newspaper = {
      id: newspaper.uid,
      type: 'newspaper'
    }
  }
}
