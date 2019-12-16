import * as services from '@/services';
import Issue from '@/models/Issue';
import Page from '@/models/Page';
import Article from '@/models/Article';
import ArticleBase from '@/models/ArticleBase';
import store from '../store';

export default {
  namespaced: true,
  state: {
    showOutlines: false,
    viewerMode: 'text', // text or image
    pagesIndex: {},
    issue: null,
  },
  mutations: {
    UPDATE_VIEWER_MODE(state, viewerMode) {
      state.viewerMode = viewerMode;
    },
    UPDATE_OUTLINES(state, showOutlines) {
      state.showOutlines = showOutlines;
    },
    SET_ISSUE(state, issue) {
      state.issue = issue;
    },
    SET_ISSUE_ARTICLES(state, articles) {
      state.issue.articles = articles;
    },
    SET_PAGE_INDEX(state) {
      // create or reset page index to quickly get access to the desired page
      state.pagesIndex = {};
      state.issue.pages.forEach((page, i) => {
        state.pagesIndex[page.uid] = i;
      });
      console.info('>>> store.issue.SET_PAGE_INDEX', state.issue.pages.length);
    },
    SET_PAGE_ARTICLE(state, { pageIdx, articleIdx }) {
      state.issue.pages[pageIdx].articles.push(state.issue.articles[articleIdx]);
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
    LOAD_ISSUE({ commit }, uid) {
      return services.issues.get(uid, {}).then((d) => {
        const issue = new Issue(d);
        commit('SET_ISSUE', issue);
        // create or reset page index to quickly get access to the desired page
        const pagesIndex = {};
        issue.pages.forEach((page, i) => {
          pagesIndex[page.uid] = i;
        });
        commit('SET_PAGE_INDEX', pagesIndex);
        return issue;
      });
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
    LOAD_TABLE_OF_CONTENTS({ commit, state }) {
      const tocPromise = services.tableOfContents.get(state.issue.uid, {})
        .then(({ articles }) => articles.map(d => new ArticleBase(d)));

      const imagesPromise = services.images.find({
        query: {
          filters: [{
            type: 'issue',
            q: state.issue.uid,
          }],
          order_by: 'id',
          limit: 500,
        },
      }).then(({ data }) => data).catch((err) => {
        // forward to service
        console.error(err);
        return [];
      });

      return Promise.all([tocPromise, imagesPromise]).then(([articles, images]) => {
        // articles are sorted by id
        const uids = articles.map(d => d.uid);
        // merge the table of images into the table of articles
        images.forEach((image) => {
          if (image.article) {
            const idx = uids.indexOf(image.article.uid || image.article);
            if (idx !== -1) {
              articles[idx].images.push(new Article(image));
            }
          } else {
            // it will be inserted later in the right page
            console.info('Image added as article, no article has been attached to it:', image);
            articles.push(new Article(image));
          }
        });

        commit('SET_ISSUE_ARTICLES', articles);
        // refresh table of contents
        for (let i = 0, l = articles.length; i < l; i += 1) {
          for (let ii = 0, ll = articles[i].pages.length; ii < ll; ii += 1) {
            const pageUid = articles[i].pages[ii].uid;
            if (state.pagesIndex[pageUid] > -1) {
              commit('SET_PAGE_ARTICLE', {
                pageIdx: state.pagesIndex[pageUid],
                articleIdx: i,
              });
            } else {
              console.info('state.pagesIndex', state.pagesIndex);
              console.error(`page nout found on issue: '${pageUid}', skipping`);
            }
          }
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
