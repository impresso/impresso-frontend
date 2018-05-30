import * as services from '@/services';
import Issue from '@/models/Issue';
import Page from '@/models/Page';

export default {
  namespaced: true,
  state: {
    issue: new Issue(),
  },
  getters: {},
  mutations: {
    UPDATE_ISSUE(state, payload) {
      state.issue = new Issue(payload);
    },
    UPDATE_PAGE(state, payload) {
      const index = state.issue.pages.findIndex(page => page.uid === payload.uid);
      state.issue.pages[index] = new Page(payload);
    },
  },
  actions: {
    LOAD_ISSUE(context, uid) {
      services.issues.get(uid, {}).then((response) => {
        context.commit('UPDATE_ISSUE', {
          countArticles: response.count_articles,
          countPages: response.count_pages,
          date: response.date,
          entities: response.entities,
          newspaper: response.newspaper,
          pages: response.pages,
          uid: response.uid,
          year: response.year,
        });
      });
    },
    LOAD_PAGE(context, page) {
      services.pages.get(page.uid, {}).then((response) => {
        context.commit('UPDATE_PAGE', {
          articles: response.articles,
          articlesEntities: response.articles_entities,
          articlesTags: response.articles_tags,
          entities: response.entities,
          iiif: response.iiif,
          labels: response.labels,
          num: response.num,
          regions: response.regions,
          tags: response.tags,
          uid: response.uid,
        });
      });
    },
  },
};
