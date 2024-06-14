import { defineStore } from 'pinia'
import { topics as topicsService } from '@/services'
import Topic from '@/models/Topic'

interface State {
  pagination: {
    perPage: number
    currentPage: number
    totalRows: number
  }
  items: any[],
  itemsIndex: Record<string, any>
  visualizedItemsIndex: Record<string, boolean>
  isLoading: boolean
  applyCurrentSearchFilters: boolean
  orderBy: string
  topicModel: string
  visualizedItems: any[]
}

interface LoadTopicsArgs {
  page?: number
  limit?: number
  q?: string
  facets?: string[]
  filters?: any[]
}

export const useTopicsStore = defineStore('topics', {
  state: (): State => ({
    pagination: {
      perPage: 200,
      currentPage: 1,
      totalRows: 0,
    },
    items: [],
    itemsIndex: {},
    visualizedItemsIndex: {},
    isLoading: false,
    applyCurrentSearchFilters: true,
    orderBy: '-name',
    topicModel: '*',
    visualizedItems: [],
  }),
  getters: {},
  actions: {
    loadTopics({
      page = 1,
      limit,
      q,
      facets,
      filters = [],
    }: LoadTopicsArgs = {}) {
      const query: Record<string, any> = {
        limit,
        page,
      };

      if (filters?.length) {
        query.filters = filters;
      }
      if (q && q.length > 1) {
        query.q = `${q.split('*').join('')}*`;
      }
      if (facets) {
        query.facets = facets;
      }

      if (limit) {
        this.pagination.perPage = limit;
      }
      // console.info('topics/LOAD_TOPICS query:', query);
      return topicsService.find({
        query,
      }).then((res) => {
        const data = res.data.map((d: any) => new Topic(d, {
          highlight: query.q ? q?.split('*')?.join('') : '',
        }));

        this.items = data;
        this.itemsIndex = {};
        data.forEach((d: any, k: string) => {
          if (this.visualizedItemsIndex[d.uid]) {
            data[k].visualized = true;
          }
          this.itemsIndex[d.uid] = k;
        });

        this.pagination.currentPage = page;
        this.pagination.totalRows = res.total;
        return {
          ...res,
          data,
        };
      });
    },
    updateApplyCurrentSearchFilters(value: boolean) {
      this.applyCurrentSearchFilters = value
    },
    updateTopicModel(topicModel: string) {
      this.topicModel = topicModel;
    },
    updateOrderBy(orderBy: string) {
      this.orderBy = orderBy;
    },
    resetVisualizedItem() {
      this.visualizedItemsIndex = {};
      this.visualizedItems = [];
    },
    addVisualizedItem(item: any) {
      if (this.visualizedItemsIndex[item.uid] != null) {
        return;
      }
      this.visualizedItemsIndex = {
        ...this.visualizedItemsIndex,
        [item.uid]: this.visualizedItems.length,
      };
      // copy the item, we don't want to loose it.
      const clonedTopic = new Topic({ ...item });
      this.visualizedItems.push(clonedTopic);
    },
    removeVisualizedItem(item: any) {
      if (this.visualizedItemsIndex[item.uid] == null) {
        return;
      }
      const idx = this.visualizedItemsIndex[item.uid];
      this.visualizedItems.splice(idx as any, 1);
      // reset visualizedItemsIndex.
      this.visualizedItemsIndex = {};
      this.visualizedItems.forEach((d, k) => {
        this.visualizedItemsIndex[d.uid] = k as any;
      });
    },
    async toggleVisualizedItem(item: any) {
      if (typeof this.visualizedItemsIndex[item.uid] !== 'undefined') {
        this.removeVisualizedItem(item);
        return false;
      }
      this.addVisualizedItem(item);
      return true;
    }
  },
  persist: {
    paths: [],
  },
})
