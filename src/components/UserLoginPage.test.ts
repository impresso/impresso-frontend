import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter, type LocationQueryRaw, type Router } from 'vue-router'
import UserLoginPage from './UserLoginPage.vue'

// The feathers app and services are mocked at the boundary of `@/services`,
// so tests exercise the full component → user store → service chain, the
// same one used in production (see issue #2074: the authentication strategy
// rejects inactive users with a 403 instead of the generic 401).
const { authenticate, findMe, findTermsOfUse } = vi.hoisted(() => ({
  authenticate: vi.fn(),
  findMe: vi.fn(),
  findTermsOfUse: vi.fn()
}))

vi.mock('@/services', () => ({
  app: { authenticate },
  me: { find: findMe },
  termsOfUse: { find: findTermsOfUse },
  MEDIA_COOKIE_NAME: 'impresso_jwt',
  MIDDLELAYER_MEDIA_PATH: '/media'
}))

/** Build a Feathers-like error, as thrown by `app.authenticate()` on failure. */
const feathersError = (code: number, name: string, message: string) =>
  Object.assign(new Error(message), { code, name, className: name.toLowerCase(), errors: {} })

const notAuthenticatedError = () => feathersError(401, 'NotAuthenticated', 'Invalid login')
const forbiddenError = () => feathersError(403, 'Forbidden', 'User account is not active yet')

// Minimal JWT whose payload (base64 of `{ "bitmap": "AQ==" }`) can be decoded
// by `decodeJwt()` in the user store `login()` action.
const fakeJwt = ['e30', btoa(JSON.stringify({ bitmap: 'AQ==' })), 'e30'].join('.')

const successfulAuthResponse = () => ({
  accessToken: fakeJwt,
  authentication: { payload: { exp: Math.floor(Date.now() / 1000) + 3600 } },
  user: { uid: 'u1', username: 'test-user', firstname: 'Test', lastname: 'User' }
})

const mockMe = {
  uid: 'u1',
  username: 'test-user',
  firstname: 'Test',
  lastname: 'User',
  isActive: true,
  groups: []
}

/** Promise that tests can resolve/reject manually, e.g. to test pending states. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// Host rendering the matched route, so the page is mounted in its real
// position (with `useRoute()` / `useRouter()` resolving against the router).
const RootView = { name: 'RootView', template: '<router-view />' }

interface SetupOptions {
  query?: LocationQueryRaw
  attachTo?: HTMLElement
}

async function setup(options: SetupOptions = {}): Promise<{ wrapper: VueWrapper; router: Router }> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div class="home-page-stub" />' } },
      { path: '/search', name: 'search', component: { template: '<div class="search-page-stub" />' } },
      { path: '/user/login', name: 'login', component: UserLoginPage },
      { path: '/user/register', name: 'register', component: { template: '<div />' } },
      { path: '/password-reset', name: 'passwordReset', component: { template: '<div />' } }
    ]
  })
  await router.push({ name: 'login', query: options.query })
  const wrapper = mount(RootView, {
    attachTo: options.attachTo,
    global: {
      plugins: [
        router,
        createPinia(),
        (app: App) => {
          Object.assign(app.config.globalProperties, {
            $t: (key: string) => key,
            $n: String,
            $d: String
          })
        }
      ],
      stubs: {
        'i-layout': { template: '<div class="i-layout-stub"><slot /></div>' },
        'i-layout-section': { template: '<div class="i-layout-section-stub"><slot /></div>' },
        // lightweight stand-in for impresso-ui-components Alert; keeps the slot content.
        Alert: {
          name: 'Alert',
          props: ['type'],
          template: '<div class="Alert-stub" :data-type="type"><slot /></div>'
        }
      }
    }
  })
  return { wrapper, router }
}

async function fillCredentials(
  wrapper: VueWrapper,
  { email = 'user@example.com', password = 'secret' } = {}
) {
  await wrapper.get('#inputEmail').setValue(email)
  await wrapper.get('#inputPassword').setValue(password)
}

async function submitLogin(wrapper: VueWrapper) {
  await wrapper.get('form.form-signin').trigger('submit')
  await flushPromises()
}

const mounted: Awaited<ReturnType<typeof setup>>[] = []

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'info').mockImplementation(() => {})
  vi.spyOn(console, 'debug').mockImplementation(() => {})
  // Happy path by default; individual tests override what they need.
  authenticate.mockResolvedValue(successfulAuthResponse())
  findTermsOfUse.mockResolvedValue({ dateAcceptedTerms: '2026-11-16T00:00:00.000Z' })
  findMe.mockResolvedValue(mockMe)
})

afterEach(() => {
  mounted.splice(0).forEach(({ wrapper }) => wrapper.unmount())
  vi.restoreAllMocks()
})

describe('UserLoginPage', () => {
  it('focuses the email input after mounting', async () => {
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    const container = document.createElement('div')
    document.body.appendChild(container)
    try {
      const { wrapper, router } = await setup({ attachTo: container })
      mounted.push({ wrapper, router })

      expect(requestFrame).toHaveBeenCalledOnce()
      requestFrame.mock.calls[0]![0](0)
      expect(document.activeElement).toBe(wrapper.get('#inputEmail').element)
    } finally {
      container.remove()
    }
  })

  it('renders the sign-in form without any error message', async () => {
    const { wrapper } = await setup()
    mounted.push({ wrapper, router: wrapper.vm.$router })
    expect(wrapper.find('#inputEmail').exists()).toBe(true)
    expect(wrapper.find('#inputPassword').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
    // no auth feedback before the user attempts to log in
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('.Alert-stub').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('accountPendingTitle')
  })

  it('associates visible labels and autocomplete purposes with the credential fields', async () => {
    const { wrapper } = await setup()
    mounted.push({ wrapper, router: wrapper.vm.$router })

    for (const [id, label, name] of [
      ['inputEmail', 'emailAddress', 'email'],
      ['inputPassword', 'password', 'password']
    ]) {
      const input = wrapper.get(`#${id}`)
      const fieldLabel = wrapper.get(`label[for="${id}"]`)
      expect(fieldLabel.text()).toBe(label)
      expect(fieldLabel.classes()).not.toContain('sr-only')
      expect(fieldLabel.classes()).not.toContain('visually-hidden')
      expect(input.attributes('name')).toBe(name)
      expect(input.attributes('required')).toBeDefined()
      expect(input.attributes('autocomplete')).toBe('off')
    }

    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(wrapper.get('#inputEmail').attributes('autocomplete')).toBe('email')
    expect(wrapper.get('#inputPassword').attributes('autocomplete')).toBe('current-password')
    await wrapper.get('input[type="checkbox"]').setValue(false)
    expect(wrapper.get('#inputEmail').attributes('autocomplete')).toBe('off')
    expect(wrapper.get('#inputPassword').attributes('autocomplete')).toBe('off')
  })

  describe('account pending activation (#2074)', () => {
    it('shows the account pending activation notice instead of a generic auth error when login is rejected with 403', async () => {
      authenticate.mockRejectedValue(forbiddenError())
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      await fillCredentials(wrapper)
      await submitLogin(wrapper)

      // info alert with the dedicated pending-activation copy
      const alert = wrapper.get('.Alert-stub')
      expect(alert.attributes('data-type')).toBe('info')
      expect(alert.element.parentElement?.getAttribute('role')).toBe('status')
      expect(alert.text()).toContain('accountPendingTitle')
      expect(alert.text()).toContain('accountPendingBody')
      // ...and not the generic auth error
      expect(wrapper.text()).not.toContain('loginFailed')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('shows the generic login failed error for invalid credentials (401), not the pending activation notice', async () => {
      authenticate.mockRejectedValue(notAuthenticatedError())
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      await fillCredentials(wrapper)
      await submitLogin(wrapper)

      // error alert with the login-failed copy
      const alert = wrapper.get('.Alert-stub')
      expect(alert.attributes('data-type')).toBe('error')
      expect(alert.classes()).toContain('border-danger')
      expect(alert.element.parentElement?.getAttribute('role')).toBe('status')
      expect(alert.text()).toContain('loginFailed')
      expect(alert.text()).toContain('loginFailedBody')
      // ...and not the pending activation notice
      expect(wrapper.text()).not.toContain('accountPendingTitle')
    })

    it('replaces the pending activation notice when the next attempt fails differently', async () => {
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      authenticate.mockRejectedValueOnce(forbiddenError())
      await fillCredentials(wrapper)
      await submitLogin(wrapper)
      expect(wrapper.get('.Alert-stub').text()).toContain('accountPendingTitle')

      // second attempt: wrong password → generic error
      authenticate.mockRejectedValueOnce(notAuthenticatedError())
      await wrapper.get('#inputPassword').setValue('wrong-password')
      await submitLogin(wrapper)
      const alert = wrapper.get('.Alert-stub')
      expect(alert.attributes('data-type')).toBe('error')
      expect(alert.text()).toContain('loginFailed')
      expect(wrapper.text()).not.toContain('accountPendingTitle')
    })

    it('clears the pending activation notice once the login succeeds', async () => {
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      authenticate.mockRejectedValueOnce(forbiddenError())
      await fillCredentials(wrapper)
      await submitLogin(wrapper)
      expect(wrapper.get('.Alert-stub').text()).toContain('accountPendingTitle')

      // staff activates the account in the meantime → login now succeeds
      await submitLogin(wrapper)
      expect(wrapper.find('.Alert-stub').exists()).toBe(false)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('does not display any auth message for other errors', async () => {
      authenticate.mockRejectedValue(feathersError(500, 'GeneralError', 'Something went wrong'))
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      await fillCredentials(wrapper)
      await submitLogin(wrapper)

      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(wrapper.find('.Alert-stub').exists()).toBe(false)
      expect(console.warn).toHaveBeenCalledWith('[UserLoginPage] error', expect.anything())
    })
  })

  describe('login behaviour', () => {
    it('announces when a login is in progress and clears the announcement afterwards', async () => {
      const pending = deferred<ReturnType<typeof successfulAuthResponse>>()
      authenticate.mockReturnValue(pending.promise)
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      const status = wrapper.get('.footer [role="status"]')
      expect(status.text()).toBe('')
      await fillCredentials(wrapper)
      await wrapper.get('form.form-signin').trigger('submit')
      expect(status.text()).toBe('login_button_loading')

      pending.reject(notAuthenticatedError())
      await flushPromises()
      expect(status.text()).toBe('')
      const alert = wrapper.get('.Alert-stub')
      expect(alert.attributes('data-type')).toBe('error')
      expect(alert.text()).toContain('loginFailed')
    })

    it('authenticates via the feathers local strategy with the entered credentials', async () => {
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      await fillCredentials(wrapper, { email: 'daniele@example.com', password: 'impresso' })
      await submitLogin(wrapper)

      expect(authenticate).toHaveBeenCalledExactlyOnceWith({
        strategy: 'local',
        email: 'daniele@example.com',
        password: 'impresso'
      })
    })

    it('redirects to the requested page after a successful login', async () => {
      const { wrapper, router } = await setup({ query: { redirect: '/search' } })
      mounted.push({ wrapper, router })

      await fillCredentials(wrapper)
      await submitLogin(wrapper)

      expect(router.currentRoute.value.name).toBe('search')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('disables the submit button while logging in and ignores duplicate submits', async () => {
      const pending = deferred<ReturnType<typeof successfulAuthResponse>>()
      authenticate.mockReturnValue(pending.promise)
      const { wrapper } = await setup()
      mounted.push({ wrapper, router: wrapper.vm.$router })

      await fillCredentials(wrapper)
      await wrapper.get('form.form-signin').trigger('submit')

      const submitButton = wrapper.get('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
      // the button shows a loading label while the request is pending
      expect(submitButton.text()).toBe('login_button_loading')

      // a second submit while the request is pending must not re-authenticate
      await wrapper.get('form.form-signin').trigger('submit')
      expect(authenticate).toHaveBeenCalledTimes(1)

      // reject instead of resolve so the page (and its button) stays mounted
      pending.reject(notAuthenticatedError())
      await flushPromises()
      expect(submitButton.attributes('disabled')).toBeUndefined()
      expect(submitButton.text()).toBe('login_button')
      const alert = wrapper.get('.Alert-stub')
      expect(alert.attributes('data-type')).toBe('error')
      expect(alert.text()).toContain('loginFailed')
    })
  })
})
