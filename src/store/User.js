import * as services from '@/services';
import User from '@/models/User';

export default {
  namespaced: true,
  state: {
    rememberCredetials: false,
    userData: false,
  },
  getters: {},
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
      this.commit('SET_PROCESSING', true);
      return new Promise((resolve, reject) => {
        services.app.logout().then((res) => {
          context.commit('CLEAR_USER');
          this.commit('SET_PROCESSING', false);
          resolve(res);
        }, (err) => {
          this.commit('SET_PROCESSING', false);
          reject(err);
        });
      });
    },
    LOGIN(context, payload) {
      this.commit('SET_PROCESSING', true);

      return new Promise(
        (resolve, reject) => {
          services.app.authenticate({
            strategy: 'local',
            email: payload.email,
            password: payload.password,
          })
          .then(res => services.app.passport.verifyJWT(res.accessToken))
          .then(res => services.app.service('users').get(res.userId))
          .then(
            (user) => {
              services.app.set('user', user);

              context.commit('SET_USER', new User({
                uid: user.uid,
                username: user.username,
                isStaff: user.is_staff,
              }));

              this.commit('SET_PROCESSING', false);
              resolve();
            },
          )
          .catch(
            (err) => {
              this.commit('SET_PROCESSING', false);
              reject(err);
            },
          );
        },
      );
    },
  },
};
