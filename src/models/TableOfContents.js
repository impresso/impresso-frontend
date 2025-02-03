import ArticleBase from './ArticleBase'

export default class TableOfContents {
  constructor({ articles = [], images = [], newspaper = {} }) {
    this.articles = articles.map(d => new ArticleBase(d))
    this.images = images
    this.newspaper = {
      id: newspaper.uid,
      type: 'newspaper'
    }
  }
}
