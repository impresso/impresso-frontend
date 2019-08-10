import * as services from '@/services';
import Issue from '@/models/Issue';
import Page from '@/models/Page';
import Article from '@/models/Article';
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
      return services.search.find({
        query: {
          group_by: 'articles',
          filters: [
            {
              type: 'page',
              q: uid,
            },
          ].concat(store.state.search.search.getFilters()),
          limit: 2,
        },
      }).then(result => result.data);
    },
    SEARCH_UIDS(context, uids) {
      return services.search.find({
        query: {
          group_by: 'articles',
          filters: [
            {
              type: 'uid',
              q: uids,
            },
          ].concat(store.state.search.search.getFilters()),
          limit: 2,
        },
      }).then(result => result.data);
    },
    LOAD_ISSUE(context, uid) {
      return services.issues.get(uid, {}).then(issue => new Issue(issue));
    },
    LOAD_PAGE(context, uid) {
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
        articles: articles.data.map(article => new Article(article)),
        articlesEntities: page.articlesEntities,
        articlesTags: page.articlesTags,
      }))
      .catch((err) => {
        console.error(err);
      });
    },
    LOAD_ARTICLE(context, uid) {
      return services.articles.get(uid).then(d => new Article(d));
    },
    LOAD_TABLE_OF_CONTENTS(context, issueUid) {
      const articlesPromise = services.articles.find({
        query: {
          filters: [{
            type: 'hasTextContents',
          }, {
            type: 'issue',
            q: issueUid,
          }],
          limit: 500,
        },
      }).then(({ data }) => data.map(d => new Article(d)));

      const imagesPromise = services.images.find({
        query: {
          filters: [{
            type: 'issue',
            q: issueUid,
          }],
        },
        limit: 500,
      }).then(({ data }) => data);

      return Promise.all([articlesPromise, imagesPromise]).then(([articles, images]) => {
        if (!images.length) {
          return articles;
        }
        // merge the table of images into the table of articles
        // for (let i = 0; i < values[0].pages.length; i += 1) {
        //   for (let j = 0; j < values[0].pages[i].articles.length; j += 1) {
        //     values[0].pages[i].articles[j].images =
        //       values[1].data.filter(image =>
        //       image.article === values[0].pages[i].articles[j].uid)
        //       .map(image => new Article(image));
        //   }
        // }
        return articles;
      });
    },
  },
};
