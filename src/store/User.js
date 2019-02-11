import * as services from '@/services';
import User from '@/models/User';

export default {
  namespaced: true,
  state: {
    rememberCredetials: false,
    userData: false,
  },
  getters: {
    user(state) {
      return state.userData;
    },
  },
  mutations: {
    SET_REMEMBER_CREDENTIALS(state, payload) {
      state.rememberCredetials = payload.remember;
    },
    SET_USER(state, payload) {
      state.userData = payload;
    },
    CLEAR_USER(state) {
      state.userData = false;
    },
  },
  actions: {
    LOGOUT(context) {
      return new Promise((resolve, reject) => {
        services.app.logout().then((res) => {
          context.commit('CLEAR_USER');
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    },
    LOGIN(context, credentials) {
      return new Promise((resolve, reject) => {
        services.app
          .authenticate(credentials ? {
            strategy: 'local',
            ...credentials,
          } : undefined)
          .then(res => services.app.passport.verifyJWT(res.accessToken), reject)
          .then(res => services.app.service('users').get(res.userId), reject)
          .then((user) => {
            services.app.set('user', user);
            context.commit('SET_USER', new User({
              ...user,
              picture: user.profile.picture,
              pattern: user.profile.pattern,
            }));
            context.dispatch('collections/LOAD_COLLECTIONS', null, {
              root: true,
            });
            resolve(user);
          }, reject)
          .catch(
            (err) => {
              reject(err.data);
            },
          );
      });
    },
  },
};
