import { defineStore } from 'pinia'
import { app, me as meService } from '@/services'
import User from '@/models/User'
import { PlanEducational, PlanGuest, PlanImpressoUser, PlanResearcher } from '@/constants'

export interface State {
  userData: User | false
  rememberCredentials: boolean
  redirectionParams: any
  acceptTermsDate: string | null
  acceptTermsDateOnLocalStorage: string | null
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    userData: false,
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
      let userPlan = state.userData !== null && state.acceptTermsDate ? PlanImpressoUser : PlanGuest
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
          this.userData = false
        })
    },
    async refreshUser() {
      return meService.find().then(d => {
        const user = new User(d)
        this.userData = user
        return user
      })
    },
    async login({ email, password }: { email: string; password: string }) {
      return (app as any)
        .authenticate({
          strategy: 'local',
          email,
          password
        })
        .then(res => {
          console.info('Authentication response:', res)
          return res
        })
        .then(({ user }) => {
          console.info('LOGIN: user', user.username, 'logged in!')
          // don't save cookie
          // const expiredDate = new Date(authentication?.payload?.exp * 1000)
          // document.cookie = 'feathers-jwt=' + accessToken + '; expires=' + expiredDate.toUTCString() + '; path=/';
          app.set('user', user)
          this.userData = new User({
            ...user,
            picture: user.profile.picture,
            pattern: user.profile.pattern
          })
          return user
        })
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
      this.redirectionParams = params
    }
  },
  persist: {
    paths: ['rememberCredentials', 'userData', 'acceptTermsDateOnLocalStorage']
  }
})
