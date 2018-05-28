import * as services from '@/services';
import Issue from '@/models/Issue';
import Newspaper from '@/models/Newspaper';
import Entity from '@/models/Entity';
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
  },
  actions: {
    LOAD_ISSUE(context, uid) {
      services.issues.get(uid, {}).then((response) => {
        context.commit('UPDATE_ISSUE', {
          countArticles: response.count_articles,
          countPages: response.count_pages,
          date: new Date(response.date),
          entities: response.entities.map(entity =>
            new Entity({
              df: entity.df,
              labels: entity.labels.map(label => label),
              name: entity.name,
              uid: entity.uid,
            }),
          ),
          newspaper: new Newspaper({
            acronym: response.newspaper.acronym,
            countArticles: response.newspaper.count_articles,
            countIssues: response.newspaper.count_issues,
            countPages: response.newspaper.count_pages,
            deltaYear: response.newspaper.delta_year,
            endYear: response.newspaper.end_year,
            name: response.newspaper.name,
            startYear: response.newspaper.start_year,
            uid: response.newspaper.uid,
          }),
          pages: response.pages.map(page => new Page({
            iiif: page.iiif,
            num: page.num,
            uid: page.uid,
          })),
          uid: response.uid,
          year: response.year,
        });
      });
    },
  },
};
