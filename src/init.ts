import type { App } from 'vue'
import { version as versionService, app as appService } from '@/services'
import { useUserStore } from './stores/user'
import { useNotificationsStore } from './stores/notifications'

const DefaultImpressoFeatures = {
  textReuse: { enabled: true },
}

const reducedTimeoutPromise = ({ ms = 500, service }) =>
  new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(`Timed out in ${ms} ms for service: ${service}`))
    }, ms)
  })

export const initSequence = async () => Promise.race([
  appService.reAuthenticate(),
  reducedTimeoutPromise({ ms: 2000, service: 'app.reAuthenticate' }),
])
  .catch(err => {
    if (err.code === 401) {
      // eslint-disable-next-line
      console.debug('[main] Not authenticated (status 401):', err.message)
      const userStore = useUserStore()

      if (userStore.user) {
        // eslint-disable-next-line
        console.debug(
          '[main] Authentication failed ... but an user is present in logalStorage. Force logging out.',
        )
        userStore.logout()

        const notificationsStore = useNotificationsStore()
        notificationsStore.displayError({
          error: err,
          origin: 'services.app.reAuthenticate',
        })
      }
    } else {
      console.error(err)
    }
  })
  .then(() => {
    // eslint-disable-next-line
    console.debug('[main] Loading app & data version...')
    return Promise.race([
      reducedTimeoutPromise({ service: 'version' }),
      versionService.find().then(res => ({
        version: res.version,
        apiVersion: res.apiVersion,
        documentsDateSpan: res.documentsDateSpan,
        newspapers: res.newspapers,
        features: res.features,
      })),
    ]).catch(err => {
      console.warn(err)
      return {
        version: 'n/a',
        documentsDateSpan: { firstDate: '1700-01-01', lastDate: new Date().toISOString() },
        apiVersion: {},
        newspapers: {},
      }
    })
  })
  .then(
    ({
      version,
      documentsDateSpan,
      newspapers,
      apiVersion = {},
      features = DefaultImpressoFeatures,
    }) => {
      console.info(
        '%cimpresso-middle-layer version',
        'font-weight: bold',
        '\n - tag:',
        apiVersion.version,
        '\n - branch:',
        apiVersion.branch,
        `\n - url: https://github.com/impresso/impresso-middle-layer/commit/${apiVersion.revision}`,
        '\n - name:',
        version,
        '\n - date range: ',
        documentsDateSpan,
        '\n - features:',
        features,
      )
      window.impressoFrontendVersion = import.meta.env.VITE_GIT_TAG
      window.impressoFrontendRevision = import.meta.env.VITE_GIT_REVISION
      window.impressoFrontendBranch = import.meta.env.VITE_GIT_BRANCH
      window.impressoVersion = version
      window.impressoApiVersion = apiVersion
      window.impressoDocumentsDateSpan = documentsDateSpan
      window.impressoNewspapers = newspapers
      window.impressoFeatures = features
      window.impressoDocumentsYearSpan = {
        firstYear: new Date(documentsDateSpan.firstDate).getFullYear(),
        lastYear: new Date(documentsDateSpan.lastDate).getFullYear(),
      }
      window.impressoInfo = {
        frontend: {
          version: window.impressoFrontendVersion,
          revision: window.impressoFrontendRevision,
          branch: window.impressoFrontendBranch,
          gitRepoUrl: import.meta.env.VITE_GIT_REPO,
          gitCommitUrl: `${import.meta.env.VITE_GIT_REPO}/commit/${window.impressoFrontendRevision}`,
          gitCommitUrlLabel: import.meta.env.VITE_GIT_REPO.split('/')
            .slice(3, 5)
            .join('/'),
        },
        middleLayer: {
          version: 'v' + window.impressoApiVersion.version,
          revision: window.impressoApiVersion.revision,
          branch: window.impressoApiVersion.branch,
          gitRepoUrl: import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO,
          gitCommitUrl: `${import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO}/commit/${window.impressoApiVersion.revision}`,
          gitCommitUrlLabel: import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO.split('/')
            .slice(3, 5)
            .join('/'),
        },
        project: {
          repoUrl: import.meta.env.VITE_GIT_REPO.split('/')
            .slice(0, 4)
            .join('/'),
          repoUrlLabel: import.meta.env.VITE_GIT_REPO.split('/')
            .slice(3, 5)
            .join('/'),
        },
      }
    },
  )
