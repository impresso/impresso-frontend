import * as services from '@/services';
import Issue from '@/models/Issue';
import Page from '@/models/Page';
import Article from '@/models/Article';
import Match from '@/models/Match';
import store from '../store';

export default {
  namespaced: true,
  state: {
    viewerMode: 'text', // text or image
  },
  mutations: {
    UPDATE_VIEWER_MODE(state, viewerMode) {
      state.viewerMode = viewerMode;
    },
  },
  actions: {
    SEARCH_PAGE(context, uid) {
      const filters = store.state.search.search.getFilters();
      return services.search.find({
        query: {
          group_by: 'articles',
          filters: [
            {
              type: 'page',
              q: uid,
            },
          ].concat(filters),
          limit: 1,
        },
      }).then(result => result.data);
    },
    LOAD_ISSUE(context, uid) {
      return services.issues.get(uid, {}).then(issue => new Issue(issue));
    },
    LOAD_PAGE(context, uid) {
      console.log('store/issue/LOAD_PAGE', uid);
      return Promise.all([
        services.pages.get(uid, {}).catch((err) => {
          console.error('Error in `store/issue/LOAD_PAGE` pages.get(', uid, ')', err.name);
          throw err;
        }),
        services.articles.find({
          query: {
            filters: [{
              type: 'page',
              q: uid,
            }],
            limit: 500,
          },
        }),
      ]).then(([page, articles]) => new Page({
        ...page,
        matches: [articles.data.map(match => new Match(match))],
        articles: articles.data.map(article => new Article(article)),
        articlesEntities: page.articlesEntities,
        articlesTags: page.articlesTags,
      }))
      .catch((err) => {
        console.error(err);
      });
    },
    LOAD_TABLE_OF_CONTENTS(context, uid) {
      const tocPromise = new Promise((resolve, reject) => {
        const q = {
          query: {
            filters: [{
              type: 'hasTextContents',
            }, {
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

      const toiPromise = new Promise((resolve, reject) => {
        const query = {
          filters: [{
            type: 'issue',
            q: uid,
          }],
          limit: 500,
        };

        services.images.find({ query }).then(resolve, reject);
      });

      return Promise.all([tocPromise, toiPromise]).then((values) => {
        // merge the table of images into the table of articles
        for (let i = 0; i < values[0].pages.length; i += 1) {
          for (let j = 0; j < values[0].pages[i].articles.length; j += 1) {
            values[0].pages[i].articles[j].images =
              values[1].data.filter(image => image.article === values[0].pages[i].articles[j].uid)
              .map(image => new Article(image));
          }
        }
        return values[0];
      });
    },
  },
};
