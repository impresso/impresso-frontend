import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { errorCollector } from '@/services'

import settings from './Settings'
import user from './User'
import search from './Search'
import searchImages from './SearchImages'
import topics from './Topics'
import monitor from './Monitor'
import selectionMonitor from './SelectionMonitor'
import notifications from './Notifications'

Vue.use(Vuex)

const ERRORS_DO_NOT_DISPLAY = ['NavigationDuplicated'] // error names not to display to the user
const ERRORS_DO_NOT_FORWARD = ['BadGateway', 'TransportError', 'NotAuthenticated', 'BadRequest'] // error to avoid loopholes

let processingTimer // timeout object

export default new Store({
  modules: {
    settings,
    search,
    searchImages,
    user,
    topics,
    monitor,
    selectionMonitor,
    notifications,
  },
  state: {
    processingStatus: false,
    processingLocked: false,
    processing_message: '',
    error_message: '',
    // error message handling,
    errorMessages: [],
    errorMessagesIndex: [],
    // processing queue
    processingActivities: [],
    processingActivitiesIndex: [],
    header_title: '',
    header_subtitle: '',
    connectivityStatus: true,
    redirectionParams: {},
  },
  getters: {
    headerTitle(state) {
      let title = ''

      if (state.header_title.length > 0 && state.header_subtitle.length > 0) {
        title = `<span class="title">${state.header_title}</span> / <span class="subtitle">${state.header_subtitle}</span>`
      } else if (state.header_subtitle.length > 0) {
        title = `<span class="subtitle">${state.header_subtitle}</span>`
      } else if (state.header_title.length > 0) {
        title = `<span class="title">${state.header_title}</span>`
      }

      return title
    },
    redirectionParams(state) {
      return state.redirectionParams
    },
  },
  mutations: {
    SET_HEADER_TITLE(state, payload) {
      state.header_title = String(payload.title || '')
      state.header_subtitle = String(payload.subtitle || '')
    },
    LOCK_SCREEN(state, status) {
      state.processingLocked = status
    },
    SET_PROCESSING(state, status) {
      if (processingTimer) {
        clearTimeout(processingTimer)
      }
      if (status) {
        state.processingStatus = status
      } else {
        processingTimer = setTimeout(() => {
          state.processingStatus = false
        }, 500)
      }
    },
    SET_REDIRECTION_ROUTE(state, params) {
      state.redirectionParams = params
    },
    SET_ERROR_MESSAGE(state, message) {
      state.error_message = message
    },
    PUSH_ERROR_MESSAGE(state, { route, message, code, name }) {
      const hash = JSON.stringify([...route, code, name])
      if (!state.errorMessagesIndex.includes(hash)) {
        state.errorMessagesIndex.push(hash)
        state.errorMessages.push({ route, message, code, name })
      }
    },
    CLEAN_ERROR_MESSAGE(state) {
      state.errorMessagesIndex = []
      state.errorMessages = []
    },
    SET_CONNECTIVITY_STATUS(state, status) {
      state.connectivityStatus = status
    },
    PUSH_PROCESSING_ACTIVITY(state, { route, status }) {
      const idx = state.processingActivitiesIndex.indexOf(route)
      if (idx < 0) {
        state.processingActivitiesIndex.push(route)
        state.processingActivities.push({ route, status, c: 1 })
      } else {
        state.processingActivities[idx].c += 1
      }
    },
    REMOVE_PROCESSING_ACTIVITY(state, { route }) {
      const idx = state.processingActivitiesIndex.indexOf(route)
      if (idx > -1) {
        state.processingActivities.splice(idx, 1)
        state.processingActivitiesIndex.splice(idx, 1)
      }
    },
  },
  actions: {
    SET_REDIRECTION_ROUTE({ commit }, params) {
      console.info('/SET_REDIRECTION_ROUTE', params)
      commit('SET_REDIRECTION_ROUTE', params)
    },
    UPDATE_PROCESSING_ACTIVITY({ state, commit }, { route, status }) {
      if (status === 'LOADING') {
        commit('PUSH_PROCESSING_ACTIVITY', { route, status })
      } else if (status === 'LONG') {
        commit('PUSH_PROCESSING_ACTIVITY', { route, status })
      } else if (status === 'DONE') {
        commit('REMOVE_PROCESSING_ACTIVITY', { route, status })
      }
      // console.info('current activities:', state.processingActivitiesIndex.length, state.processingActivitiesIndex);
      // check active ones
      commit('SET_PROCESSING', !!state.processingActivitiesIndex.length)
    },
    DISPLAY_CONNECTIVITY_STATUS({ commit }, status) {
      commit('SET_CONNECTIVITY_STATUS', Boolean(status))
    },
    CLEAN_ERROR_MESSAGE({ commit }) {
      commit('CLEAN_ERROR_MESSAGE')
    },
    async DISPLAY_ERROR({ commit }, { error, origin = '' }) {
      const errorRoute = []
      // get error route if possible
      if (error.hook) {
        try {
          errorRoute.push(error.hook.path)
          errorRoute.push(error.hook.method)
        } catch (e) {
          console.warn(e)
        }
      }
      console.error(
        `[Unexpected error ${error.name}]: ${errorRoute.join('.')} (origin:${origin})`,
        error.code,
        error.name,
        error.message,
        error,
      )
      if (errorRoute.length && errorRoute[0] === 'errors-collector') {
        console.info(
          'Error',
          error.name,
          'at',
          errorRoute,
          'has not been dispatched. Source: errors-collector. Risk of loopholes',
        )
      } else {
        if (!ERRORS_DO_NOT_DISPLAY.includes(error.name)) {
          commit('PUSH_ERROR_MESSAGE', {
            route: errorRoute,
            message: error.message,
            code: error.code,
            name: error.name,
          })
        }

        // do not force if BadGateway or polling error (risk of having endless and useless loops)
        if (ERRORS_DO_NOT_FORWARD.filter(d => d === error.name || d === error.type).length) {
          console.info(
            'Error',
            error.name,
            'at',
            errorRoute,
            'has not been dispatched, risk of loopholes',
          )
        } else {
          await errorCollector
            .create({
              uri: errorRoute.length ? errorRoute.join('.') : 'N/A',
              ...error,
            })
            .catch(err => {
              console.error('[Unexpected error in sending the error]', err)
            })
        }
      }
    },
  },
  plugins: [
    createPersistedState({
      key: 'impresso',
      paths: [
        'settings.termsAgreed',
        'settings.cookiesAccepted',
        'settings.lastNotificationDate',
        'settings.language_code',
        'search.searches',
        'search.currentSearchHash',
        'search.displaySortBy',
        'search.displaySortOrder',
        'search.displayStyle',
        'search.filterFacetYearExpanded',
        'user.rememberCredetials',
        'user.userData',
        'newspapers.orderBy',
      ],
    }),
  ],
})
