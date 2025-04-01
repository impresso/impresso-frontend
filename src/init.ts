import { version as versionService, app as appService } from '@/services'
import { useUserStore } from './stores/user'
import { useNotificationsStore } from './stores/notifications'
import { reducedTimeoutPromise } from './services/utils'

const DefaultImpressoFeatures = {
  textReuse: { enabled: true },
  viewPlans: { enabled: true }
}

type ApiVersion = {
  version: string
  branch: string
  revision: string
}

type DocumentsDateSpan = {
  firstDate: string
  lastDate: string
}

type Features = {
  textReuse: { enabled: boolean }
  viewPlans: { enabled: boolean }
}

type VersionResponse = {
  version: string
  apiVersion: ApiVersion
  documentsDateSpan: DocumentsDateSpan
  newspapers: Record<string, unknown>
  features: Features
}

export const loadVersion = async () => {
  const res: VersionResponse = await Promise.race([
    reducedTimeoutPromise({
      ms: 2450,
      service: 'version'
    }),
    versionService.find().then(res => {
      console.info('[init:loadVersion] Version data loaded:', res)
      return res
    })
  ])
    .then(res => ({
      version: res.version,
      apiVersion: res.apiVersion,
      documentsDateSpan: res.documentsDateSpan,
      newspapers: res.newspapers,
      features: res.features
    }))
    .catch(err => {
      console.warn('[init:loadVersion] error:', err)
      return {
        apiVersion: { version: 'n/a', branch: 'n/a', revision: 'n/a' },
        version: 'n/a',
        documentsDateSpan: { firstDate: '1700-01-01', lastDate: new Date().toISOString() },
        newspapers: {},
        features: DefaultImpressoFeatures
      } as VersionResponse
    })

  console.info(
    '%cimpresso-middle-layer version',
    'font-weight: bold',
    '\n - tag:',
    res.apiVersion.version,
    '\n - branch:',
    res.apiVersion.branch,
    `\n - url: https://github.com/impresso/impresso-middle-layer/commit/${res.apiVersion.revision}`,
    '\n - name:',
    res.version,
    '\n - date range: ',
    res.documentsDateSpan,
    '\n - features:',
    res.features
  )
  const glob: any = window
  glob.impressoFrontendVersion = import.meta.env.VITE_GIT_TAG
  glob.impressoFrontendRevision = import.meta.env.VITE_GIT_REVISION
  glob.impressoFrontendBranch = import.meta.env.VITE_GIT_BRANCH
  glob.impressoVersion = res.version
  glob.impressoApiVersion = res.apiVersion
  glob.impressoDocumentsDateSpan = res.documentsDateSpan
  glob.impressoNewspapers = res.newspapers
  glob.impressoDataProviders = {
    SNL: 'Swiss National Library',
    BNL: 'Luxembourg National Library',
    NZZ: 'NZZ',
    Migros: 'Migros'
  }
  glob.impressoFeatures = { ...DefaultImpressoFeatures, ...res.features }
  glob.impressoDocumentsYearSpan = {
    firstYear: new Date(res.documentsDateSpan.firstDate).getFullYear(),
    lastYear: new Date(res.documentsDateSpan.lastDate).getFullYear()
  }
  glob.impressoInfo = {
    frontend: {
      version: glob.impressoFrontendVersion,
      revision: glob.impressoFrontendRevision,
      branch: glob.impressoFrontendBranch,
      gitRepoUrl: import.meta.env.VITE_GIT_REPO,
      gitCommitUrl: `${import.meta.env.VITE_GIT_REPO}/commit/${glob.impressoFrontendRevision}`,
      gitCommitUrlLabel: import.meta.env.VITE_GIT_REPO.split('/').slice(3, 5).join('/')
    },
    middleLayer: {
      version: glob.impressoApiVersion.version ?? 'latest',
      revision: glob.impressoApiVersion.revision,
      branch: glob.impressoApiVersion.branch,
      gitRepoUrl: import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO,
      gitCommitUrl: `${import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO}/commit/${glob.impressoApiVersion.revision}`,
      gitCommitUrlLabel: import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO.split('/').slice(3, 5).join('/')
    },
    project: {
      repoUrl: import.meta.env.VITE_GIT_REPO.split('/').slice(0, 4).join('/'),
      repoUrlLabel: import.meta.env.VITE_GIT_REPO.split('/').slice(3, 5).join('/')
    }
  }
}

export const initSequence = async () => {
  await loadVersion()
  const userStore = useUserStore()
  await Promise.race([
    appService.reAuthenticate(true),
    reducedTimeoutPromise({ ms: 2000, service: 'app.reAuthenticate' })
  ])
    .catch(err => {
      if (err.code === 401) {
        // eslint-disable-next-line
        console.debug('[init:initSequence] Not authenticated (status 401):', err.message)
        if (userStore.user) {
          // eslint-disable-next-line
          console.debug(
            '[init:initSequence] Authentication failed. However, previous user metadata are still present in localStorage. Forcing logout.'
          )
          userStore.logout()
          const notificationsStore = useNotificationsStore()
          notificationsStore.displayError({
            error: err,
            origin: 'services.app.reAuthenticate'
          })
        }
      } else {
        console.error(err)
      }
    })
    .then((res: any) => {
      if (!res) {
        console.debug('[init:initSequence] No reAuthenticateResponse')
        // force logout
        if (userStore.user) {
          userStore.logout()
        }
        return
      }
      // eslint-disable-next-line
      console.debug('[init:initSequence] Loading app & data version:', Object.keys(res))
      console.debug(
        '[init:initSequence] - username:',
        res.user.username,
        '- bitmap:',
        res.user.bitmap,
        '- groups:',
        res.user.groups
      )
      userStore.refreshUser()
    })
  return
}
