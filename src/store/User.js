import * as services from '@/services';
import User from '@/models/User';
// import router from '@/router';

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
      return services.app.logout().catch((err) => {
        console.error('error in store/User/LOGOUT');
        console.error(err);
      }).finally(() => {
        context.commit('CLEAR_USER');
      });
    },
    GET_CURRENT_USER() {
      return services.me.find().then(d => new User(d));
    },
    PATCH_CURRENT_USER() {
      console.info('user/PATCH_CURRENT_USER placeholder');
    },
    LOGIN({ commit }, { email, password }) {
      return services.app.authenticate({
        strategy: 'local',
        email,
        password,
      }).then((res) => {
        console.info('Authentication response:', res);
        return res;
      }).then(({ user }) => {
        console.info('LOGIN: user', user.username, 'logged in!');
        services.app.set('user', user);
        commit('SET_USER', new User({
          ...user,
          picture: user.profile.picture,
          pattern: user.profile.pattern,
        }));
        return user;
      });
    },
  },
};
