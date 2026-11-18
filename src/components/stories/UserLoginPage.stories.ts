import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse, delay } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { vueRouter } from 'storybook-vue3-router'
import UserLoginPage from '../UserLoginPage.vue'

/**
 * > Issue #2074 — accounts require manual activation by staff before users can
 * > log in. When a registered but not-yet-activated user tries to log in, the
 * > authentication strategy rejects the request with a 403 instead of the
 * > generic 401, and the page shows a dedicated "account pending activation"
 * > message instead of a generic auth error.
 *
 * The stories mock the REST transport (`POST /api/authentication`):
 *
 * - **AccountPendingActivation** — valid credentials of an inactive account →
 *   403 Forbidden → the dedicated pending-activation notice.
 * - **InvalidCredentials** — 401 NotAuthenticated → the generic login failed error.
 * - **LoginSucceeds** — full happy path incl. `/api/terms-of-use` and `/api/me`,
 *   ending with the redirect to the home page.
 */

const meta = {
  title: 'Pages/UserLogin',
  component: UserLoginPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Login page. On failed authentication it distinguishes invalid credentials (401 → generic error) from a not-yet-activated account (403 → pending activation notice).'
      }
    }
  },
  // The page is rendered through <router-view />, so the redirect performed
  // after a successful login is visible in the story itself.
  render: () => ({
    name: 'UserLoginPageStoryHost',
    template: '<router-view />'
  })
} satisfies Meta<typeof UserLoginPage>

export default meta
type Story = StoryObj<typeof meta>

const PENDING_ACTIVATION_EMAIL = 'not-activated@example.com'
const PENDING_ACTIVATION_PASSWORD = 'impresso'

/** Feathers-shaped 403 error, as returned by the authentication strategy for inactive accounts. */
const accountPendingActivationHandler = http.post('/api/authentication', async () => {
  await delay(400)
  return HttpResponse.json(
    {
      name: 'Forbidden',
      message: 'Your account is not active yet',
      code: 403,
      className: 'forbidden',
      errors: {}
    },
    { status: 403 }
  )
})

/** Feathers-shaped 401 error, as returned for wrong credentials. */
const invalidCredentialsHandler = http.post('/api/authentication', async () => {
  await delay(400)
  return HttpResponse.json(
    {
      name: 'NotAuthenticated',
      message: 'Invalid login',
      code: 401,
      className: 'not-authenticated',
      errors: {}
    },
    { status: 401 }
  )
})

const successfulLoginHandler = http.post('/api/authentication', async () => {
  await delay(400)
  return HttpResponse.json({
    // payload is a valid base64-encoded JSON so the user store can decode it
    accessToken: `e30.${btoa(JSON.stringify({ bitmap: 'AQ==' }))}.e30`,
    authentication: { payload: { exp: Math.floor(Date.now() / 1000) + 3600 } },
    user: {
      uid: 'u1',
      username: 'story-user',
      firstname: 'Story',
      lastname: 'User',
      isActive: true
    }
  })
})

const getTermsOfUseHandler = http.get('/api/terms-of-use', () =>
  HttpResponse.json({ dateAcceptedTerms: new Date().toISOString() })
)

const getMeHandler = http.get('/api/me', () =>
  HttpResponse.json({
    uid: 'u1',
    username: 'story-user',
    firstname: 'Story',
    lastname: 'User',
    isActive: true,
    isStaff: false,
    bitmap: 'AQ==',
    groups: [{ name: 'plan-researcher' }]
  })
)

/** Decorator giving each story a pristine pinia instance (no persisted state). */
const withFreshPinia: Decorator = story => ({
  components: { Story: story() },
  setup() {
    setActivePinia(createPinia())
    return {}
  },
  template: '<Story />'
})

/**
 * Route component wrapping the login page. When `credentials` is passed, the
 * form is filled and submitted on mount so that the resulting state (error or
 * successful login) is visible without interaction.
 */
const loginRouteComponent = (credentials?: {
  email: string
  password: string
}) =>
  defineComponent({
    name: 'UserLoginPageStory',
    components: { UserLoginPage },
    template: '<UserLoginPage />',
    mounted() {
      if (!credentials) return
      const root = this.$el as HTMLElement
      const fill = (selector: string, value: string) => {
        const input = root.querySelector<HTMLInputElement>(selector)
        if (!input) return
        input.value = value
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
      fill('#inputEmail', credentials.email)
      fill('#inputPassword', credentials.password)
      root.querySelector('form')?.requestSubmit()
    }
  })

const loginStoryRoutes = (credentials?: { email: string; password: string }) => [
  { path: '/user/login', name: 'login', component: loginRouteComponent(credentials) },
  {
    path: '/',
    name: 'home',
    component: {
      template: `
        <div style="padding: 2rem;">
          <h2>Home page</h2>
          <p>Login was successful — you were redirected to the home page.</p>
        </div>
      `
    }
  },
  {
    path: '/user/register',
    name: 'register',
    component: { template: '<div style="padding: 2rem;">Register page stub</div>' }
  },
  {
    path: '/password-reset',
    name: 'passwordReset',
    component: { template: '<div style="padding: 2rem;">Password reset page stub</div>' }
  }
]

const loginPageDecorators = (credentials?: { email: string; password: string }) => [
  withFreshPinia,
  vueRouter(loginStoryRoutes(credentials), { initialRoute: '/user/login' })
]

/**
 * The login page as a visitor first sees it: no feedback message. Submitting
 * any credentials hits the mocked backend, which responds with the
 * pending-activation error (see AccountPendingActivation).
 */
export const Default: Story = {
  decorators: loginPageDecorators(),
  parameters: {
    msw: {
      handlers: [accountPendingActivationHandler]
    }
  }
}

/**
 * Issue #2074 — valid credentials of a not-yet-activated account: the backend
 * rejects authentication with 403 and the page shows a clear "account pending
 * activation" notice instead of a generic auth error. The form is submitted
 * automatically on mount; feel free to log in again to replay the flow.
 */
export const AccountPendingActivation: Story = {
  decorators: loginPageDecorators({
    email: PENDING_ACTIVATION_EMAIL,
    password: PENDING_ACTIVATION_PASSWORD
  }),
  parameters: {
    msw: {
      handlers: [accountPendingActivationHandler]
    }
  }
}

/**
 * Wrong credentials: the backend rejects authentication with 401 and the page
 * shows the generic login failed error — not the pending activation notice.
 * The form is submitted automatically on mount.
 */
export const InvalidCredentials: Story = {
  decorators: loginPageDecorators({
    email: 'daniele@example.com',
    password: 'wrong-password'
  }),
  parameters: {
    msw: {
      handlers: [invalidCredentialsHandler]
    }
  }
}

/**
 * Once staff has activated the account, the same credentials log in
 * successfully and the user is redirected to the home page. Mocks the full
 * login chain: `POST /api/authentication`, `/api/terms-of-use` and `/api/me`.
 */
export const LoginSucceeds: Story = {
  decorators: loginPageDecorators({
    email: 'daniele@example.com',
    password: 'impresso'
  }),
  parameters: {
    msw: {
      handlers: [successfulLoginHandler, getTermsOfUseHandler, getMeHandler]
    }
  }
}
