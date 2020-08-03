import ArticleBase from './ArticleBase';

export default class TableOfContents {
  constructor({
    articles=[],
    images=[]
  }) {
    this.articles = articles
      .map(d => new ArticleBase(d))
    this.images = images;
  }
}
