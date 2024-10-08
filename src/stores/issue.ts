import { defineStore } from 'pinia'
import {
  issues as issuesService,
  pages as pagesService,
  articles as articlesService,
  tableOfContents as tableOfContentsService,
  images as imagesService,
} from '@/services'
import Issue from '@/models/Issue'
import Page from '@/models/Page'
import Article from '@/models/Article'
import ArticleBase from '@/models/ArticleBase'

type ViewerMode = 'text' | 'image'

interface State {
  showOutlines: boolean
  viewerMode: ViewerMode
  pagesIndex: Record<string, number>
  issue: Issue | null
}

export const useIssueStore = defineStore('issue', {
  state: (): State => ({
    showOutlines: false,
    viewerMode: 'text',
    pagesIndex: {},
    issue: null,
  }),
  getters: {},
  actions: {
    updateViewerMode(mode: ViewerMode) {
      this.viewerMode = mode
    },
    updateOutlines(showOutlines: boolean) {
      this.showOutlines = showOutlines
    },
    loadIssue(uid: string) {
      return issuesService.get(uid, {}).then((d) => {
        const issue = new Issue(d);
        this.issue = issue

        // create or reset page index to quickly get access to the desired page
        const pagesIndex = {};
        issue.pages.forEach((page, i) => {
          pagesIndex[page.uid] = i;
        });
        this.pagesIndex = pagesIndex
      });
    },
    loadPage(uid: string) {
      return Promise.all([
        pagesService.get(uid, {}).catch((err) => {
          console.error('Error in `store/issue/LOAD_PAGE` pages.get(', uid, ')', err.name);
          throw err;
        }),
        articlesService.find({
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
    loadArticle(uid: string) {
      return articlesService.get(uid).then(d => new Article(d));
    },
    loadTableOfContents() {
      if (this.issue == null) {
        throw new Error('Issue not loaded, skipping table of contents')
      }
      const tocPromise = tableOfContentsService.get(this.issue.uid, {})
        .then(({ articles }) => articles.map(d => new ArticleBase(d)));

      const imagesPromise = imagesService.find({
        query: {
          filters: [{
            type: 'issue',
            q: this.issue.uid,
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

        if (this.issue == null) throw new Error('Issue not loaded, skipping table of contents');

        this.issue.articles = articles;
        // refresh table of contents
        for (let i = 0, l = articles.length; i < l; i += 1) {
          for (let ii = 0, ll = articles[i].pages.length; ii < ll; ii += 1) {
            const pageUid = articles[i].pages[ii].uid;
            if (this.pagesIndex[pageUid] > -1) {
              const pageIdx = this.pagesIndex[pageUid];
              const articleIdx = i;

              this.issue.pages[pageIdx].articles.push(this.issue.articles[articleIdx]);
            } else {
              console.info('state.pagesIndex', this.pagesIndex);
              console.error(`page nout found on issue: '${pageUid}', skipping`);
            }
          }
        }
        return articles;
      });
    },
  },
  persist: {
    paths: ['viewerMode', 'showOutlines'],
  },
})
