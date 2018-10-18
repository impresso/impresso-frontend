import * as services from '@/services';
import Issue from '@/models/Issue';
import Page from '@/models/Page';
import Article from '@/models/Article';

export default {
  namespaced: true,
  state: {
    issue: new Issue(),
    viewerMode: 'image', // text or image
    toc: [], // array of Article objects
    article: new Article(),
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
    UPDATE_ARTICLES(state, payload) {
      const pageIndex = state.issue.pages.findIndex(page => page.uid === payload.uid);
      state.issue.pages[pageIndex].articles = payload.articles;
    },
    UPDATE_TOC(state, payload) {
      state.toc = payload.articles;
    },
    UPDATE_ARTICLE(state, payload) {
      const index = state.issue.articles.findIndex(article => article.uid === payload.uid);
      state.issue.articles[index] = new Article(payload);
    },
    UPDATE_VIEWER_MODE(state, viewerMode) {
      state.viewerMode = viewerMode;
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
              return new Article(article);
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
    LOAD_ARTICLES(context, uid) {
      return new Promise((resolve, reject) => {
        const q = {
          query: {
            filters: [{
              type: 'page',
              q: uid,
            }],
            limit: 500,
          },
        };
        services.articles.find(q)
        .then((response) => {
          context.commit('UPDATE_ARTICLES', {
            articles: response.data.map(article => new Article({
              ...article,
            })),
            uid,
          });
          resolve(response);
        }, (error) => {
          reject(error);
        });
      });
    },
    LOAD_ARTICLE(context, uid) {
      return new Promise((resolve, reject) => {
        services.articles.get(uid, {}).then((response) => {
          this.article = new Article(response);
          resolve(response);
        }, (error) => {
          reject(error);
        });
      });
    },
    LOAD_TOC(context, uid) {
      return new Promise((resolve, reject) => {
        const q = {
          query: {
            filters: [{
              type: 'issue',
              q: uid,
            }],
            limit: 500,
          },
        };
        services.articles.find(q)
          .then((response) => {
            context.commit('UPDATE_TOC', {
              articles: response.data.map(article => new Article({
                ...article,
              })),
              uid,
            });
            resolve(response);
          }, (error) => {
            reject(error);
          });
      });
    },
  },
};
