// https://github.com/delay/feathers-vue-blog-admin-demo/blob/master/client/src/services/index.js
import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';

import articlesSuggestionsHooks from './hooks/articlesSuggestions';
import uploadedImagesHooks from './hooks/uploadedImages';
import imagesHooks from './hooks/images';
import searchQueriesComparisonHooks from './hooks/searchQueriesComparison';


const MiddleLayerApiBase = `${process.env.VUE_APP_MIDDLELAYER_API}`;
const socket = io(MiddleLayerApiBase || window.location.hostname, {
  path: process.env.VUE_APP_MIDDLELAYER_API_SOCKET_PATH,
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
  if (window.app && window.app.$store) {
    window.app.$store.dispatch('DISPLAY_CONNECTIVITY_STATUS', true);
  }
}); // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

socket.on('connect_error', (err) => {
  if (window.app && window.app.$store) {
    err.message = `Could not connect to the API: ${err.message}`;
    console.error(err);
    window.app.$store.dispatch('DISPLAY_CONNECTIVITY_STATUS', false);
    window.app.$store.commit('LOCK_SCREEN', false);
  }
});

const needsLockScreen = p => [
  'search.find',
].includes(p);

app.hooks({
  before: {
    all: [
      (context) => {
        const route = `${context.path}.${context.method}`;
        if (window.app && window.app.$store) {
          window.app.$store.dispatch('UPDATE_PROCESSING_ACTIVITY', { route, status: 'LOADING' });
          if (needsLockScreen(route) && context.params.lock !== false) {
            window.app.$store.commit('LOCK_SCREEN', true);
          }
        }
      },
    ],
  },
  after: {
    all: [
      (context) => {
        const route = `${context.path}.${context.method}`;
        if (window.app && window.app.$store) {
          window.app.$store.dispatch('UPDATE_PROCESSING_ACTIVITY', { route, status: 'DONE' });
          if (needsLockScreen(route)) {
            window.app.$store.commit('LOCK_SCREEN', false);
          }
        }
      },
    ],
  },
  error: {
    all: [
      (context) => {
        const route = `${context.path}.${context.method}`;
        if (window.app && window.app.$store) {
          // handle not authenticated error when removing authentication
          if (route === 'authentication.remove' && context.error.name === 'NotAuthenticated') {
            console.info('Ingore NotAuthenticated error on "authentication.remove" route.');
          } else {
            window.app.$store.dispatch('DISPLAY_ERROR', {
              error: context.error,
              origin: 'app.hooks.error.all',
            });
          }
          window.app.$store.dispatch('UPDATE_PROCESSING_ACTIVITY', { route, status: 'DONE' });
          if (needsLockScreen(route)) {
            window.app.$store.commit('LOCK_SCREEN', false);
          }
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
    if (window.app && window.app.$store) {
      window.app.$store.dispatch('jobs/UPDATE_JOB', {
        ...payload.job,
        progress: payload.progress,
        extra,
      });
    }
  }
});

// repeat this line for every service in our backend
export const version = app.service('version');
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
export const errorCollector = app.service('errors-collector');

export const MIDDLELAYER_API = process.env.VUE_APP_MIDDLELAYER_API;
export const MIDDLELAYER_MEDIA_PATH = process.env.VUE_APP_MIDDLELAYER_MEDIA_PATH;
export const MIDDLELAYER_MEDIA_URL = [MIDDLELAYER_API, MIDDLELAYER_MEDIA_PATH].join('');
