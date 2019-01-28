import * as services from '@/services';
import Issue from '@/models/Issue';
import Page from '@/models/Page';
import Article from '@/models/Article';

export default {
  namespaced: true,
  state: {
    viewerMode: 'image', // text or image
  },
  getters: {},
  mutations: {
    UPDATE_VIEWER_MODE(state, viewerMode) {
      state.viewerMode = viewerMode;
    },
  },
  actions: {
    LOAD_ISSUE(context, uid) {
      return new Promise((resolve, reject) => {
        services.issues.get(uid, {}).then((response) => {
          resolve(new Issue({
            collections: response.collections,
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
          }));
        }, (error) => {
          reject(error);
        });
      });
    },
    LOAD_PAGE(context, uid) {
      return new Promise((resolve, reject) => {
        services.pages.get(uid, {}).then((page) => {
          services.articles.find({
            query: {
              filters: [{
                type: 'page',
                q: uid,
              }],
              limit: 500,
            },
          })
          .then((articles) => {
            resolve(new Page({
              ...page,
              articles: articles.data.map(article => new Article({
                ...article,
                regions: article.regions.map(region => ({
                  ...region,
                  iiifFragment: region.iiif_fragment,
                })),
              })),
              articlesEntities: page.articlesEntities,
              articlesTags: page.articlesTags,
            }));
          }, (error) => {
            reject(error);
          });
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
            const issue = new Issue();
            const articles = response.data.map(article => new Article({
              ...article,
            }));

            articles.forEach((article) => {
              article.pages.forEach((p1) => {
                const page = issue.pages.find(p2 => p1.uid === p2.uid);
                if (!page) {
                  issue.pages.push(new Page({
                    ...p1,
                    articles: [article],
                  }));
                } else {
                  page.articles.push(article);
                }
              });
            });

            // sort by page number
            issue.pages.sort((pageA, pageB) => {
              if (pageA.num < pageB.num) {
                return -1;
              }
              if (pageA.num > pageB.num) {
                return 1;
              }

              return 0;
            });

            resolve(issue);
          }, (error) => {
            reject(error);
          });
      });
    },
  },
};
