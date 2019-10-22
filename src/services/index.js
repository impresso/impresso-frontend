// https://github.com/delay/feathers-vue-blog-admin-demo/blob/master/client/src/services/index.js
import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';

import articlesSuggestionsHooks from './hooks/articlesSuggestions';
import uploadedImagesHooks from './hooks/uploadedImages';
import imagesHooks from './hooks/images';
import searchQueriesComparisonHooks from './hooks/searchQueriesComparison';


const socket = io(`${process.env.MIDDLELAYER_API}`, {
  path: `${process.env.MIDDLELAYER_API_SOCKET_PATH}`,
});

export const app = feathers();

app.configure(socketio(socket, {
  timeout: 130000,
}));
app.configure(auth({
  storage: window.localStorage,
}));

socket.on('reconnect', () => {
  app.reAuthenticate();
}); // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

const needsLockScreen = p => [
  'search.find',
].includes(p);

app.hooks({
  before: {
    all: [
      (context) => {
        const fullPath = `${context.path}.${context.method}`;
        if (window.app && window.app.$store) {
          window.app.$store.state.error_message = '';
          window.app.$store.state.processing_message = fullPath;
          window.app.$store.commit('SET_PROCESSING', true);
          if (needsLockScreen(fullPath)) {
            window.app.$store.commit('LOCK_SCREEN', true);
          }
        }
      },
    ],
  },
  after: {
    all: [
      (context) => {
        const fullPath = `${context.path}.${context.method}`;
        if (window.app && window.app.$store) {
          window.app.$store.state.error_message = '';
          window.app.$store.commit('SET_PROCESSING', false);
          if (needsLockScreen(fullPath)) {
            window.app.$store.commit('LOCK_SCREEN', false);
          }
        }
      },
    ],
  },
  error: {
    all: [
      (context) => {
        const apiPath = `paths.${context.path}.${context.method}`;
        const errorPath = `errors.${context.error.message.split(/\s\(\)`/).join('')}`;
        console.error('app ERROR on:', apiPath, context.error, errorPath);
        if (window.app && window.app.$store) {
          window.app.$store.state.error_message = [
            window.app.$t(errorPath),
            window.app.$t(apiPath),
          ].join(' ');
          window.app.$store.commit('SET_PROCESSING', false);
          window.app.$store.commit('LOCK_SCREEN', false);
        }
      },
    ],
  },
});

app.service('logs').on('created', (payload) => {
  console.info('@logs->created', payload);
  if (payload.job) {
    const extra = {};
    if (payload.collection) {
      extra.collection = payload.collection;
    }
    window.app.$store.dispatch('jobs/UPDATE_JOB', {
      ...payload.job,
      progress: payload.progress,
      extra,
    });
  }
});

// repeat this line for every service in our backend
export const suggestions = app.service('suggestions');
export const articles = app.service('articles');
export const images = app.service('images').hooks(imagesHooks);
export const issues = app.service('issues');
export const issuesTimeline = app.service('issues-timelines');
export const pages = app.service('pages');
export const pagesTimelines = app.service('pages-timelines');
export const search = app.service('search');
export const newspapers = app.service('newspapers');
export const collections = app.service('collections');
export const collectionsItems = app.service('collectable-items');
export const topics = app.service('topics');
export const jobs = app.service('jobs');
export const exporter = app.service('search-exporter');
export const articlesSuggestions = app.service('articles-suggestions').hooks(articlesSuggestionsHooks);
export const entities = app.service('entities');
export const mentions = app.service('mentions');
export const embeddings = app.service('embeddings');
export const uploadedImages = app.service('uploaded-images').hooks(uploadedImagesHooks);
export const searchFacets = app.service('search-facets');
export const tableOfContents = app.service('table-of-contents');
export const searchQueriesComparison = app.service('search-queries-comparison').hooks(searchQueriesComparisonHooks);

export const MIDDLELAYER_API = `${process.env.MIDDLELAYER_API}`;
export const MIDDLELAYER_MEDIA_PATH = `${process.env.MIDDLELAYER_MEDIA_PATH}`;
export const MIDDLELAYER_MEDIA_URL = [MIDDLELAYER_API, MIDDLELAYER_MEDIA_PATH].join('');
