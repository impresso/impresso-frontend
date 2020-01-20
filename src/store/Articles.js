/* eslint-disable no-unused-vars */
import { articles } from '@/services';
import Article from '@/models/Article';


export default {
  namespaced: true,
  actions: {
    LOAD_ARTICLE(context, uid) {
      return articles.get(uid)
        .then(d => new Article(d));
    },
  },
};
