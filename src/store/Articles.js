/* eslint-disable no-unused-vars */
import { articles } from '@/services';
import Article from '@/models/Article';


export default {
  namespaced: true,
  actions: {
    LOAD_ARTICLE(context, uid) {
      return new Promise((resolve, reject) => {
        articles.get(uid).then((result) => {
          resolve(new Article(result));
        }).catch((err) => {
          reject(err);
        });
      });
    },
  },
};
