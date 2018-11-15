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
              articlesEntities: page.articles_entities.map((item) => {
                item.articleUid = item.article_uid;
                item.entityUid = item.entity_uid;
                return item;
              }),
              articlesTags: page.articles_tags.map((tag) => {
                tag.articleUid = tag.article_uid;
                tag.properties.creationDate = tag.properties.creation_date;
                tag.properties.creationTime = tag.properties.creation_time;
                tag.properties.lastModifiedDate = tag.properties.last_modified_date;
                tag.properties.lastModifiedTime = tag.properties.last_modified_time;
                return tag;
              }),
              regions: page.regions.map((region) => {
                region.articleUid = region.article_uid;
                return region;
              }),
              tags: page.tags.map((tag) => {
                tag.appliesTo = tag.applies_to;
                return tag;
              }),
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
