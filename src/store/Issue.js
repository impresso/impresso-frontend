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
        context.commit('UPDATE_ISSUE', response);
      });
    },
    LOAD_PAGE(context, page) {
      services.pages.get(page.uid, {}).then((res) => {
        context.commit('UPDATE_PAGE', res);
      });
    },
  },
};
