import Article from './Article'
import ArticleEntity from './ArticleEntity'
import Collection from './Collection'
import Entity from './Entity'
import Region from './Region'
import ArticleTag from './ArticleTag'
import Tag from './Tag'

export interface IPage {
  articles: Article[]
  articlesEntities: ArticleEntity[]
  articlesTags: ArticleTag[]
  collections: Collection[]
  entities: Entity[]
  iiif: string
  iiifThumbnail: string
  labels: string[]
  num: number
  regions: Region[]
  tags: Tag[]
  uid: string
}

/**
 * @class Page is an object representing a newspaper page
 * @param {Array} articles Array of Article objects
 * @param {Array} articlesEntities Array of ArticleEntity objects
 * @param {Array} articlesTags Array of ArticleTag objects
 * @param {Array} collections List of Collection objects the page belongs to
 * @param {Array} entities Array of Entity objects
 * @param {Url} iiif Link to iiif resource
 * @param {Array} labels Array of Strings with labels describing the page
 * @param {Integer} num Page number
 * @param {Array} regions Array of ArticleRegions objects
 * @param {Array} tags Array of Tag objects
 * @param {String} uid Unique identifier for the newspaper
 */
export default class Page implements IPage {
  articles: Article[]
  articlesEntities: ArticleEntity[]
  articlesTags: ArticleTag[]
  collections: Collection[]
  entities: Entity[]
  iiif: string
  iiifThumbnail: string
  labels: string[]
  num: number
  regions: Region[]
  tags: Tag[]
  uid: string

  constructor({
    articles = [],
    articlesEntities = [],
    articlesTags = [],
    collections = [],
    entities = [],
    iiif = '',
    iiifThumbnail = '',
    labels = ['page'],
    num = 0,
    regions = [],
    tags = [],
    uid = ''
  } = {}) {
    this.articles = articles.map(article => {
      if (article instanceof Article) {
        return article
      }

      return new Article(article)
    })

    this.articlesEntities = articlesEntities.map(articleEntity => {
      if (articleEntity instanceof ArticleEntity) {
        return articleEntity
      }

      return new ArticleEntity(articleEntity)
    })

    this.articlesTags = articlesTags.map(articleTag => {
      if (articleTag instanceof ArticleTag) {
        return articleTag
      }

      return new ArticleTag(articleTag)
    })

    this.collections = collections.map(collection => {
      if (collection instanceof Collection) {
        return collection
      }

      return new Collection(collection)
    })

    this.entities = entities.map(entity => {
      if (entity instanceof Entity) {
        return entity
      }

      return new Entity(entity)
    })

    this.iiif = String(iiif)
    this.iiifThumbnail = String(iiifThumbnail)
    this.labels = labels.map(label => String(label))
    this.num = typeof num !== 'number' ? parseInt(num, 10) : num

    this.regions = regions.map(region => {
      if (region instanceof Region) {
        return region
      }

      return new Region(region)
    })

    this.tags = tags.map(tag => {
      if (tag instanceof Tag) {
        return tag
      }

      return new Tag(tag)
    })

    this.uid = String(uid)
  }

  getIiifThumbnail({ dim = 150 }) {
    return getIiifThumbnail(this.iiif, { dim })
  }
}

export const getIiifThumbnail = (iiif: string, { dim = 150 }) => {
  const iiifUrl = iiif.replace('/info.json', '')
  return `${iiifUrl}/full/${dim},/0/default.png`
}
