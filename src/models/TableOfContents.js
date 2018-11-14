import Article from '@/models/Article';

export default function TableOfContents({
  uid = '', // uid of the issue
  articles = [],
} = {}) {
  this.articles = articles.map((article) => {
    if (article instanceof Article) {
      return article;
    }
    return new Article(article);
  });

  this.uid = String(uid);
}
