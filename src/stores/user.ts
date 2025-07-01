import { defineStore } from 'pinia'
import {
  app,
  MEDIA_COOKIE_NAME,
  me as meService,
  termsOfUse as termsOfUseService,
  MIDDLELAYER_MEDIA_PATH
} from '@/services'
import User from '@/models/User'
import { PlanEducational, PlanGuest, PlanImpressoUser, PlanNone, PlanResearcher } from '@/constants'
import { removeCookie, setCookie } from '@/util/cookies'
import { TermsOfUse } from '@/services/types'

export interface State {
  userData: User | false
  bitmap: string
  rememberCredentials: boolean
  redirectionParams: any
  acceptTermsDate: string | null
  acceptTermsDateOnLocalStorage: string | null
  hasPendingChangePlanRequest: boolean
}

interface IAuthResult {
  accessToken?: string
  authentication?: {
    payload?: {
      exp?: number // expiration timestamp
    }
  }
  user?: User
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    userData: false,
    bitmap: '1',
    rememberCredentials: false,
    redirectionParams: {},
    // this is not stored on localStorage, and if it is not null is a ISO date string
    acceptTermsDate: null,
    // this is stored on localStorage
    acceptTermsDateOnLocalStorage: null,
    //
    hasPendingChangePlanRequest: false
  }),
  getters: {
    user(state) {
      return state.userData
    },

    userPlan(state) {
      if (!state.acceptTermsDate) {
        return PlanGuest
      }
      let userPlan = state.userData !== null ? PlanNone : PlanGuest
      if (state.userData && Array.isArray(state.userData?.groups)) {
        const SortedAvailablePlans = [PlanResearcher, PlanEducational, PlanImpressoUser]
        for (const planName of SortedAvailablePlans) {
          if (state.userData.groups.some(g => g.name === planName)) {
            userPlan = planName
            break
          }
        }
      }
      if (userPlan === PlanNone && state.hasPendingChangePlanRequest) {
        userPlan = PlanImpressoUser // default to Impresso User if no plan is set but there is a pending request
      }
      return userPlan
    }
  },
  actions: {
    setAcceptTermsDate(date: string | null) {
      this.acceptTermsDate = date
      this.acceptTermsDateOnLocalStorage = date
    },
    setPendingChangePlanRequest(v: boolean) {
      this.hasPendingChangePlanRequest = v
    },
    setBitmap(bitmap: string) {
      this.bitmap = bitmap
    },
    logout() {
      return (app as any)
        .logout()
        .catch(err => {
          console.error('error in store/User/LOGOUT')
          console.error(err)
        })
        .finally(() => {
          // remove from localstorage
          localStorage.removeItem('feathers-jwt')
          removeCookie(MEDIA_COOKIE_NAME, MIDDLELAYER_MEDIA_PATH)
          // clean terms date and bitmap
          this.userData = false
          this.acceptTermsDate = null
        })
    },
    setUserData(user: User | false) {
      if (user) {
        this.userData = new User({ ...user })
      } else {
        this.userData = false
      }
    },
    async refreshUser() {
      return meService
        .find()
        .then(d => {
          console.info('[store/user]', d)
          const user = new User(d)
          this.userData = user
          return user
        })
        .catch(err => {
          if (err.response?.status === 401) {
            this.userData = false
          }
          throw err
        })
    },
    async login({ email, password }: { email: string; password: string }) {
      const authResult = await app.authenticate({ strategy: 'local', email, password })

      const { accessToken, authentication, user } = authResult as IAuthResult

      console.info('[store/user] Authentication response:', Object.keys(authResult))

      const termsOfuse: TermsOfUse | null = await termsOfUseService
        .find()
        .then((data: TermsOfUse) => {
          console.debug('[store/user] call termsOfUseService.find() success:', data)
          return data
        })
        .catch(err => {
          console.error(
            '[store/user] call termsOfUseService.find() error:',
            err.message,
            err.data,
            err.code
          )
          return null
        })
      if (termsOfuse && termsOfuse.dateAcceptedTerms) {
        this.setAcceptTermsDate(new Date(termsOfuse.dateAcceptedTerms).toISOString())
      } else {
        console.warn('[store/user] termsOfuse is null or dateAcceptedTerms is undefined.')
        this.setAcceptTermsDate(null)
      }

      if (user && user.bitmap) {
        console.info(' - bitmap:', user.bitmap)
        this.bitmap = user.bitmap
      }
      console.info('LOGIN: user', user.username, 'logged in!')

      // Set the access token in a cookie on the media path only.
      // It is used to authorize the use of media files: images, audio.
      setCookie(MEDIA_COOKIE_NAME, accessToken, {
        expires: new Date(authentication?.payload?.exp * 1000),
        sameSite: 'Lax',
        secure: window.location.hostname !== 'localhost', // allow non-secure cookie on localhost
        path: MIDDLELAYER_MEDIA_PATH
      })

      // Not using cookies to exclude CSRF attacks (https://feathersjs.com/guides/security)
      // const expiredDate = new Date(authentication?.payload?.exp * 1000)
      // document.cookie =
      //   'feathers-jwt=' + accessToken + '; expires=' + expiredDate.toUTCString() + '; path=/'
      app.set('user', user)
      this.userData = new User({
        ...user,
        picture: (user as any).profile.picture,
        pattern: (user as any).profile.pattern
      })
      return user
    },
    setRememberCredentials(remember: boolean) {
      this.rememberCredentials = remember
    },
    getCurrentUser() {
      return meService.find().then(d => new User(d))
    },
    setRedirectionRoute(params) {
      console.debug('[tores/user] setRedirectionRoute params:', params)
      this.redirectionParams = params
    }
  },
  persist: { paths: ['rememberCredentials', 'userData', 'acceptTermsDateOnLocalStorage'] }
})
