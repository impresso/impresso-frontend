// https://github.com/delay/feathers-vue-blog-admin-demo/blob/master/client/src/services/index.js
import io from 'socket.io-client';
import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import socketio from 'feathers-socketio/client';
// import localstorage from 'feathers-localstorage';
import authentication from 'feathers-authentication/client';

const socket = io(`${process.env.MIDDLELAYER_API}`);

export const app = feathers()
  .configure(socketio(socket)) // you could use Primus or REST instead
  .configure(hooks())
  .configure(authentication({
    storage: window.localStorage,
  }));

socket.on('reconnect', () => {
  app.authenticate();
}); // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

// repeat this line for every service in our backend
export const suggestion = app.service('suggestions');
