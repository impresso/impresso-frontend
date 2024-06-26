import { defineStore } from 'pinia'
import {
  search as searchService,
  mentions as mentionsService,
  entities as entitiesService,
  searchFacets as searchFacetsService,
} from '@/services'
import Article from '@/models/Article'
import Mention from '@/models/Mention'
import Entity from '@/models/Entity'
import Facet from '@/models/Facet'
import Helpers from '@/plugins/Helpers'

interface State {}

interface LoadRequest {
  page?: number
  filters?: object[]
  orderBy?: string
  faster?: string
}

export const useEntitiesStore = defineStore('entities', {
  state: (): State => ({}),
  getters: {},
  actions: {
    loadEntityArticles({ page = 1, filters = [], orderBy = '-relevance' }: LoadRequest = {}) {
      const query = {
        page,
        filters,
        order_by: orderBy,
        group_by: 'articles',
      };
      return searchService.find({
        query,
      }).then(res => ({
        ...res,
        data: res.data.map(d => new Article(d)),
      }));
    },
    loadEntityMentions({ page = 1, filters = [], orderBy = '-relevance', faster = 'on' }: LoadRequest = {}) {
      const query = {
        faster,
        page,
        filters,
        order_by: orderBy,
      };

      return mentionsService.find({
        query,
      }).then((res) => {
        return res;
      }).then(res => ({
        ...res,
        data: res.data.map((d) => {
          const mention = new Mention(d);
          if (mention.article) {
            mention.article = new Article(mention.article);
          }
          return mention;
        }),
      }));
    },
    loadDetail(entityId: string) {
      return entitiesService.get(entityId, {}).then((res) => {
        return new Entity(res);
      });
    },
    loadTimeline(entityId: string) {
      const query = {
        filters: [{
          type: 'entity',
          q: entityId,
        }],
        // group_by: 'articles',
      };
      return searchFacetsService.get('year', {
        query,
      }).then(res => Helpers.timeline.fromBuckets(res.buckets));
    },
    loadPageTopics(pageId: string) {
      const query = {
        filters: [{
          type: 'page',
          q: pageId,
        }],
        // group_by: 'articles',
      };
      return searchFacetsService.get('topic', {
        query,
      }).then((topic) => new Facet(topic));
    },
    loadPageEntities(pageId: string) {
      const query = {
        facets: ['location', 'person'],
        filters: [{
          type: 'page',
          q: pageId,
        }],
        // group_by: 'articles',
      };
      return searchFacetsService.find({
        query,
      }).then((response) => [
        new Facet(response.data[0]),
        new Facet(response.data[1]),
      ]);
    },
  },
  persist: {
    paths: [],
  },
})
