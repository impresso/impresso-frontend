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
    LOGIN({ commit }, { email, password }) {
      return services.app.authenticate({
        strategy: 'local',
        email,
        password,
      }).then(({ user }) => {
        console.info('LOGIN: user', user.username, 'logged in!');
        services.app.set('user', user);
        commit('SET_USER', new User({
          ...user,
          picture: user.profile.picture,
          pattern: user.profile.pattern,
        }));
      }).catch((err) => {
        console.error('Authentication error', err);
      });
      // return services.app.authenticate(credentials ? {
      //   strategy: 'local',
      //   ...credentials,
      // } : undefined)
      // .then(res => services.app.passport.verifyJWT(res.accessToken))
      // .then(res => services.app.service('users').get(res.userId))
      // .then((user) => {
      //   services.app.set('user', user);
      //   context.commit('SET_USER', new User({
      //     ...user,
      //     picture: user.profile.picture,
      //     pattern: user.profile.pattern,
      //   }));
      //   context.dispatch('collections/LOAD_COLLECTIONS', null, {
      //     root: true,
      //   });
      //   return user;
      // })
      // .catch((err) => {
      //   console.error('error in store/User/LOGIN');
      //   console.error(err);
      //   router.push({ name: 'login' });
      // });
    },
  },
};
