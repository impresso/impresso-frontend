import ArticleBase from './ArticleBase'

interface Newspaper {
  uid?: string
  id?: string
  type?: string
}

interface TableOfContentsConstructor {
  articles?: any[]
  images?: any[]
  newspaper?: Newspaper
}

export default class TableOfContents {
  articles: ArticleBase[]
  images: any[]
  newspaper: {
    id: string
    type: string
  }

  constructor({ articles = [], images = [], newspaper = {}, ...rest }: TableOfContentsConstructor) {
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
      id: newspaper.uid || '',
      type: 'newspaper'
    }
  }
}
