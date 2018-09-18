import * as services from '@/services';
import Issue from '@/models/Issue';
import Page from '@/models/Page';
import Article from '@/models/Article';

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
    UPDATE_ARTICLE(state, payload) {
      const index = state.issue.articles.findIndex(article => article.uid === payload.uid);
      state.issue.articles[index] = new Article(payload);
    },
  },
  actions: {
    LOAD_ISSUE(context, uid) {
      return new Promise((resolve, reject) => {
        services.issues.get(uid, {}).then((response) => {
          resolve(response);
          context.commit('UPDATE_ISSUE', {
            collections: response.buckets,
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
        }, (error) => {
          reject(error);
        });
      });
    },
    LOAD_PAGE(context, uid) {
      return new Promise((resolve, reject) => {
        services.pages.get(uid, {}).then((response) => {
          resolve(response);
          context.commit('UPDATE_PAGE', {
            ...response,
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
            regions: response.regions.map((region) => {
              region.articleUid = region.article_uid;
              return region;
            }),
            tags: response.tags.map((tag) => {
              tag.appliesTo = tag.applies_to;
              return tag;
            }),
          });
        }, (error) => {
          reject(error);
        });
      });
    },
    LOAD_ARTICLE(context, uid) {
      return new Promise((resolve, reject) => {
        services.articles.get(uid, {}).then((response) => {
          resolve(response);
          context.commit('UPDATE_ARTICLE', {
            ...response,
          });
        }, (error) => {
          reject(error);
        });
      });
    },
  },
};
