import * as services from '../services';
import User from '../modules/User';

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
    SET_USER(state, userData) {
      state.userData = userData;
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
      return new Promise((resolve, reject) => {
        context.dispatch('_AUTHENTICATE', payload).then(() => {
          context.dispatch('_GET_USER').then((res) => {
            this.commit('SET_PROCESSING', false);
            resolve(res);
          }, (err) => {
            this.commit('SET_PROCESSING', false);
            reject(err);
          });
        }, (err) => {
          this.commit('SET_PROCESSING', false);
          reject(err);
        });
      });
    },
    _AUTHENTICATE(context, payload) {
      this.commit('SET_PROCESSING', true);

      return new Promise(
        (resolve, reject) => {
          services.app.authenticate({
            strategy: 'local',
            email: payload.email,
            password: payload.password,
          }).then(
            (res) => {
              this.commit('SET_PROCESSING', false);
              resolve(res);
            },
            (err) => {
              this.commit('SET_PROCESSING', false);
              reject(err);
            },
          );
        },
      );
    },
    _GET_USER(context) {
      const userdata = {
        nameFirst: 'Thijs',
        nameLast: 'van Beek',
        email: 'thijs.vanbeek@uni.lu',
      };

      return new Promise(
        (resolve) => {
          context.commit('SET_USER', new User({
            nameFirst: userdata.nameFirst,
            nameLast: userdata.nameLast,
            email: userdata.email,
          }));
          resolve();
        },
      );
    },
  },
};
