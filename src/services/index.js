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

socket.on('reconnect', () => {
  app.authenticate();
}); // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

// repeat this line for every service in our backend
export const suggestion = app.service('suggestions');
export const authenticate = app.service('authenticate');
