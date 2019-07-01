// https://github.com/delay/feathers-vue-blog-admin-demo/blob/master/client/src/services/index.js
import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import articlesSuggestionsHooks from './hooks/articlesSuggestions';
import uploadedImagesHooks from './hooks/uploadedImages';
import imagesHooks from './hooks/images';

const socket = io(`${process.env.MIDDLELAYER_API}`, {
  path: `${process.env.MIDDLELAYER_API_SOCKET_PATH}`,
});

export const app = feathers();

app.configure(socketio(socket, {
  timeout: 30000,
}));
app.configure(auth({
  storage: window.localStorage,
}));

socket.on('reconnect', () => {
  app.authenticate();
}); // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

app.hooks({
  before: {
    all: [
      () => {
        window.app.$store.state.error_message = '';
        window.app.$store.commit('SET_PROCESSING', true);
      },
    ],
  },
  after: {
    all: [
      () => {
        window.app.$store.commit('SET_PROCESSING', false);
      },
    ],
  },
  error: {
    all: [
      (error) => {
        console.log('ERROR: ', error);
        window.app.$store.state.error_message = 'API Error : See Console for details.';
        window.app.$store.commit('SET_PROCESSING', false);
      },
    ],
  },
});

app.service('logs').on('created', (payload) => {
  if (payload.job) {
    const idx = window.app.$store.state.jobs.data.findIndex(x => x.id === payload.job.id);
    if (idx !== -1) {
      window.app.$store.state.jobs.data[idx].status = payload.job.status;
      window.app.$store.state.jobs.data[idx].task = payload.task;
      window.app.$store.state.jobs.data[idx].progress = payload.job.progress;
    } else {
      payload.job.task = payload.task;
      window.app.$store.state.jobs.data.unshift(payload.job);
    }
    // console.log(`logs.created: "${payload.msg}" with payload:`, payload);
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

export const MIDDLELAYER_API = `${process.env.MIDDLELAYER_API}`;
export const MIDDLELAYER_MEDIA_PATH = `${process.env.MIDDLELAYER_MEDIA_PATH}`;
export const MIDDLELAYER_MEDIA_URL = [MIDDLELAYER_API, MIDDLELAYER_MEDIA_PATH].join('');
