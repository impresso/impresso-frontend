// https://github.com/delay/feathers-vue-blog-admin-demo/blob/master/client/src/services/index.js
import auth from '@feathersjs/authentication-client'
import { feathers } from '@feathersjs/feathers'

import { useJobsStore } from '@/stores/jobs'
import { useNotificationsStore } from '@/stores/notifications'
import articlesSuggestionsHooks from './hooks/articlesSuggestions'
import imagesHooks from './hooks/images'
import uploadedImagesHooks from './hooks/uploadedImages'
import NamesService from './names'
import { configureRestTransport, configureSocketIoTransport } from './transport'
import type { Services } from './types'
import { DataProvidersService } from './local/dataProviders'

export const app = feathers<Services>()

const transport: 'socketio' | 'rest' = import.meta.env.VITE_API_TRANSPORT ?? 'socketio'

switch (transport) {
  case 'socketio':
    configureSocketIoTransport(app)
    break
  case 'rest':
    console.log('✨ Using REST transport')
    configureRestTransport(app)
    break
  default:
    throw new Error(`Unknown transport: ${transport}`)
}

app.configure(
  auth({
    storage: window.localStorage
  })
)

const needsLockScreen = (p: string) => ['search.find', 'ngram-trends.create'].includes(p)

const silentErrorCodes = [404, 409, 400]

app.hooks({
  before: {
    all: [
      context => {
        const route = `${context.path}.${context.method}`
        const notificationsStore = useNotificationsStore()
        notificationsStore.updateProcessingActivity({ route, status: 'LOADING' })
        if (needsLockScreen(route) && context.params.lock !== false) {
          notificationsStore.lockScreen(true)
        }
      }
    ]
  },
  after: {
    all: [
      context => {
        const route = `${context.path}.${context.method}`
        const notificationsStore = useNotificationsStore()
        notificationsStore.updateProcessingActivity({ route, status: 'DONE' })
        if (needsLockScreen(route)) {
          notificationsStore.lockScreen(false)
        }
      }
    ]
  },
  error: {
    all: [
      context => {
        const route = `${context.path}.${context.method}`
        const notificationsStore = useNotificationsStore()

        // handle not authenticated error when removing authentication
        if (context.params.ignoreErrors) {
          console.warn(
            'app.hooks.error.all:ignoreErrors',
            context.error?.name,
            '\n - route:',
            route,
            '\n - code:',
            context.error?.code,
            '\n - type:',
            context.error?.type,
            '\n - data:',
            context.error?.data
          )
        } else if (route === 'authentication.remove' && context.error.name === 'NotAuthenticated') {
          console.warn('Ignore NotAuthenticated error on "authentication.remove" route.')
        } else if (route === 'authentication.create') {
          console.warn('Ignore NotAuthenticated error on "authentication.create" route.')
        } else if (!silentErrorCodes.includes(context.error.code)) {
          // eslint-disable-next-line no-console
          console.warn('app.hooks.error.all', context.error, context.error.stack, route)
          notificationsStore.displayError({
            error: context.error,
            origin: route
          })
        }
        notificationsStore.updateProcessingActivity({ route, status: 'DONE' })
        if (needsLockScreen(route)) {
          notificationsStore.lockScreen(false)
        }
      }
    ]
  }
})

app.service('logs').on('created', payload => {
  console.info('[@logs->created]', payload)
  // if tasktype: "UUB",
  if (payload.tasktype === 'UUB') {
    // force reauthentication
    app.reAuthenticate(true).then(res => {
      console.info('[@logs->created] Reauthenticated after UUB', res)
    })
  }
  if (payload.job) {
    const extra: { collection?: any } = {}
    if (payload.collection) {
      extra.collection = payload.collection
    }
    const jobsStore = useJobsStore()
    jobsStore.updateJob({
      ...payload.job,
      progress: payload.progress,
      extra
    })
  }
})

// repeat this line for every service in our backend
export const version = app.service('version')
export const suggestions = app.service('suggestions')
export const contentItems = app.service('content-items')
export const images = app.service('images').hooks(imagesHooks)
export const issues = app.service('issues')
export const issuesTimeline = app.service('issues-timelines')
export const pages = app.service('pages')
export const pagesTimelines = app.service('pages-timelines')
export const search = app.service('search')
export const ngramTrends = app.service('ngram-trends')
export const newspapers = app.service('newspapers')
export const collections = app.service('collections')
export const collectionsItems = app.service('/collections/:collection_id/items')
export const topics = app.service('topics')
export const topicsGraph = app.service('topics-graph')
export const jobs = app.service('jobs')
export const exporter = app.service('search-exporter')
export const articlesSuggestions = app
  .service('articles-suggestions')
  .hooks(articlesSuggestionsHooks)
export const entities = app.service('entities')
export const mentions = app.service('mentions')
export const embeddings = app.service('embeddings')
export const uploadedImages = app.service('uploaded-images').hooks(uploadedImagesHooks)
export const searchFacets = app.service('search-facets/search')
export const searchFacetsImages = app.service('search-facets/images')
export const searchFacetsTRClusters = app.service('search-facets/tr-clusters')
export const searchFacetsTRPassages = app.service('search-facets/tr-passages')
export const getSearchFacetsService = (index: string) => {
  switch (index.replace(/_/g, '-')) {
    case 'search':
      return searchFacets
    case 'tr-clusters':
      return searchFacetsTRClusters
    case 'tr-passages':
      return searchFacetsTRPassages
    case 'images':
      return searchFacetsImages
    default:
      throw new Error(`Unknown search facet index: ${index}`)
  }
}
export const tableOfContents = app.service('table-of-contents')
export const searchQueriesComparison = app.service('search-queries-comparison')
export const errorCollector = app.service('errors-collector')
export const me = app.service('me')
export const users = app.service('users')
export const articleTextReusePassages = app.service('articles/:id/text-reuse-passages')
export const textReuseClusters = app.service('text-reuse-clusters')
export const textReusePassages = app.service('text-reuse-passages')
export const textReuseClusterPassages = app.service('text-reuse-cluster-passages')
export const filtersItems = app.service('filters-items')
export const stats = app.service('stats')
export const articlesRecommendations = app.service('articles-recommendations')
export const articlesSearch = app.service('articles-search')
export const entityMentionsTimeline = app.service('entity-mentions-timeline')
export const textReuseConnectedClusters = app.service('text-reuse-connected-clusters')
export const passwordReset = app.service('password-reset')
export const changePassword = app.service('change-password')
export const termsOfUse = app.service('terms-of-use')
export const userChangePlanRequest = app.service('user-change-plan-request')
export const userRequests = app.service('user-requests')
export const subscriptionDatasets = app.service('subscriptions')
export const feedback = app.service('feedback-collector')
export const datalabSupport = app.service('datalab-support')
export const barista = app.service('barista-proxy')
export const dataProviders = new DataProvidersService()

export const MIDDLELAYER_API = import.meta.env.VITE_MIDDLELAYER_API
export const MIDDLELAYER_MEDIA_PATH = import.meta.env.VITE_MIDDLELAYER_MEDIA_PATH
export const MIDDLELAYER_MEDIA_URL = [MIDDLELAYER_API, MIDDLELAYER_MEDIA_PATH].join('')
export const MEDIA_COOKIE_NAME = 'impresso_jwt'

export const getAuthenticationToken = (): string | undefined =>
  app.authentication.options.storage['feathers-jwt']
export const namesService = new NamesService()
