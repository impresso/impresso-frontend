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
          newspaper: {
            ...response.newspaper,
            countArticles: response.newspaper.count_articles,
            countIssues: response.newspaper.count_issues,
            countPages: response.newspaper.count_pages,
            deltaYear: response.newspaper.delta_year,
            endYear: response.newspaper.end_year,
            startYear: response.newspaper.start_year,
          },
          pages: response.pages,
          uid: response.uid,
          year: response.year,
        });
      });
    },
    LOAD_PAGE(context, page) {
      services.pages.get(page.uid, {}).then((response) => {
        context.commit('UPDATE_PAGE', {
          articles: response.articles.map((article) => {
            article.newspaperUid = article.newspaper_uid;
            return article;
          }),
          articlesEntities: response.articles_entities.map((item) => {
            item.articleUid = item.article_uid;
            item.entityUid = item.entity_uid;
            return item;
          }),
          articlesTags: response.articles_tags.map((tag) => {
            tag.articleUid = tag.article_uid;
            tag.properties.creationDate = tag.properties.creation_date;
            tag.properties.creationTime = tag.properties.creation_time;
            tag.properties.lastModifiedDate = tag.properties.last_modified_date;
            tag.properties.lastModifiedTime = tag.properties.last_modified_time;
            return tag;
          }),
          entities: response.entities,
          iiif: response.iiif,
          labels: response.labels,
          num: response.num,
          regions: response.regions.map((region) => {
            region.articleUid = region.article_uid;
            return region;
          }),
          tags: response.tags.map((tag) => {
            tag.appliesTo = tag.applies_to;
            return tag;
          }),
          uid: response.uid,
        });
      });
    },
  },
};
