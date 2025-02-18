import { defineStore } from 'pinia'
import { app, me as meService } from '@/services'
import User from '@/models/User'
import { PlanEducational, PlanGuest, PlanImpressoUser, PlanResearcher } from '@/constants'

export interface State {
  userData: User | false
  bitmap: string
  rememberCredentials: boolean
  redirectionParams: any
  acceptTermsDate: string | null
  acceptTermsDateOnLocalStorage: string | null
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
    acceptTermsDateOnLocalStorage: null
  }),
  getters: {
    user(state) {
      return state.userData
    },

    userPlan(state) {
      if (!state.acceptTermsDate) {
        return PlanGuest
      }
      let userPlan = state.userData !== null ? PlanImpressoUser : PlanGuest
      if (state.userData && Array.isArray(state.userData?.groups)) {
        for (const group of state.userData.groups) {
          if (group.name === PlanEducational || group.name === PlanResearcher) {
            userPlan = group.name
            break
          }
        }
      }
      return userPlan
    }
  },
  actions: {
    setAcceptTermsDate(date: string) {
      this.acceptTermsDate = date
      this.acceptTermsDateOnLocalStorage = date
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
          const expiredDate = new Date(-1)
          document.cookie = 'feathers-jwt=; expires=' + expiredDate.toUTCString() + '; path=/'
          // remove from localstorage
          localStorage.removeItem('feathers-jwt')
          // clean terms date and bitmap
          this.userData = false
          this.acceptTermsDate = null
        })
    },
    async refreshUser() {
      return meService.find().then(d => {
        console.info('[store/user]', d)
        const user = new User(d)
        this.userData = user
        return user
      })
    },
    async login({ email, password }: { email: string; password: string }) {
      const authResult = await app.authenticate({
        strategy: 'local',
        email,
        password
      })

      const { /* accessToken, authentication, */ user } = authResult as IAuthResult

      console.info('[store/user] Authentication response:', Object.keys(authResult))
      if (user && user.bitmap) {
        console.info(' - bitmap:', user.bitmap)
        this.bitmap = user.bitmap
      }
      console.info('LOGIN: user', user.username, 'logged in!')

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
    changePassword({
      uid,
      previousPassword,
      newPassword
    }: {
      uid: string
      previousPassword: string
      newPassword: string
    }) {
      return meService.patch(uid, { previousPassword, newPassword }, {})
    },
    updateCurrentUser(user: User) {
      return meService.update(user.uid, user, {}).then(d => {
        const user = new User(d)
        this.userData = user
        return user
      })
    },
    setRedirectionRoute(params) {
      console.debug('[tores/user] setRedirectionRoute params:', params)
      this.redirectionParams = params
    }
  },
  persist: {
    paths: ['rememberCredentials', 'userData', 'acceptTermsDateOnLocalStorage']
  }
})
