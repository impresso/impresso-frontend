// https://github.com/delay/feathers-vue-blog-admin-demo/blob/master/client/src/services/index.js
import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';

const socket = io(`${process.env.MIDDLELAYER_API}`, {
  path: `${process.env.MIDDLELAYER_API_SOCKET_PATH}`,
});

export const app = feathers();

app.configure(socketio(socket));
app.configure(auth({
  storage: window.localStorage,
}));

app.authenticate();

socket.on('reconnect', () => {
  app.authenticate();
}); // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

app.hooks({
  before: {
    all: [
      () => {
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
        window.app.$store.state.alert_message = `<b>${error.name}</b> - ${error.message}`;
        window.app.$store.commit('SET_PROCESSING', false);
      },
    ],
  },
});

// repeat this line for every service in our backend
export const suggestions = app.service('suggestions');
export const articles = app.service('articles');
export const issues = app.service('issues');
export const pages = app.service('pages');
export const search = app.service('search');
export const newspapers = app.service('newspapers');
export const collections = app.service('collections');
export const collectionsItems = app.service('collectable-items');
export const topics = app.service('topics');
