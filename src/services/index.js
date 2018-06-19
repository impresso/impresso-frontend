// https://github.com/delay/feathers-vue-blog-admin-demo/blob/master/client/src/services/index.js
import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';

const socket = io(`${process.env.MIDDLELAYER_API}`);

export const app = feathers()
  .configure(socketio(socket))
  .configure(auth({
    storage: window.localStorage,
  }));

app.hooks({
  before:
  {
    all: [
      () => {
        window.app.$store.commit('SET_PROCESSING', true);
      },
      async () => {
        await app.authenticate();
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
});

socket.on('reconnect', () => {
  app.authenticate();
}); // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

// repeat this line for every service in our backend
export const suggestions = app.service('suggestions');
export const articles = app.service('articles');
export const issues = app.service('issues');
export const pages = app.service('pages');
export const search = app.service('search');
export const collections = app.service('buckets');
export const collections2items = app.service('buckets-items');
