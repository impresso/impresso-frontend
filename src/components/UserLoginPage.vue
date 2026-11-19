<template>
  <i-layout id="UserLoginPage">
    <i-layout-section main class="section">
      <div class="login-form">
        <form class="form-signin" @submit.prevent="authenticate">
          <h3 class="header p-3">
            {{ $t('login_title') }}
          </h3>
          <div class="body p-3">
            <div role="status">
              <Alert v-if="errorCode === 401" type="error" class="mb-3 border border-danger">
                <div>
                  <h4 class="font-size-inherit font-weight-bold">{{ $t('loginFailed') }}</h4>
                  <p class="mb-0">{{ $t('loginFailedBody') }}</p>
                </div>
              </Alert>
              <Alert v-if="errorCode === 403" type="info" class="mb-3 border border-info">
                <div>
                  <h4 class="font-size-inherit font-weight-bold">
                    {{ $t('accountPendingTitle') }}
                  </h4>
                  <p class="mb-0">{{ $t('accountPendingBody') }}</p>
                </div>
              </Alert>
            </div>

            <div class="mb-3 form-group">
              <label for="inputEmail" class="form-label">{{ $t('emailAddress') }}</label>
              <BFormInput
                id="inputEmail"
                v-model="email"
                name="email"
                type="email"
                class="form-control rounded-sm shadow-sm rounded-sm"
                :placeholder="$t('emailAddressPlaceholder')"
                required
                autofocus
                :autocomplete="rememberCredentials ? 'email' : 'off'"
              />
            </div>
            <div class="mb-3">
              <label for="inputPassword" class="form-label">{{ $t('password') }}</label>
              <input
                id="inputPassword"
                v-model="password"
                name="password"
                type="password"
                class="form-control shadow-sm rounded-sm"
                :placeholder="$t('passwordPlaceholder')"
                required
                :autocomplete="rememberCredentials ? 'current-password' : 'off'"
              />
            </div>
            <div class="checkbox small-caps">
              <label>
                <input type="checkbox" v-model="rememberCredentials" />
                {{ $t('login_remember') }}
              </label>
            </div>

            <div class="footer mb-3">
              <button
                class="btn btn-md btn-primary btn-block"
                type="submit"
                :disabled="isSubmitting"
              >
                <span />
                {{ isSubmitting ? $t('login_button_loading') : $t('login_button') }}
              </button>
              <span class="visually-hidden" role="status" aria-live="polite">
                {{ isSubmitting ? $t('login_button_loading') : '' }}
              </span>
            </div>

            <!-- Password forgotten -->
            <p class="mb-0">
              {{ $t('forgotPassword') }} <br />
              <router-link :to="{ name: 'passwordReset' }" v-html="$t('actions.resetMyPassword')" />
            </p>
          </div>
          <div class="footer p-3">
            <h5>{{ $t('needAccount') }}</h5>
            <router-link to="register" class="btn btn-sm btn-outline-primary btn-block">{{
              $t('signup_button')
            }}</router-link>
            <p class="mt-3">
              {{ $t('anyQuestions') }} <br />{{ $t('contactUs') }}
              <a href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>
            </p>
          </div>
        </form>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'

defineOptions({ name: 'UserLoginPage' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const errorCode = ref<number | null>(null)
const isSubmitting = ref(false)

const rememberCredentials = computed({
  get: () => userStore.rememberCredentials,
  set: val => userStore.setRememberCredentials(val)
})

async function authenticate() {
  if (isSubmitting.value) return
  errorCode.value = null
  isSubmitting.value = true

  const redirect = route.query.redirect
  const path = (typeof redirect === 'string' && redirect) || (window as any).redirect || '/'
  const destination = { path, ...userStore.redirectionParams }

  try {
    await userStore.login({ email: email.value, password: password.value })
    await router.push(destination)
  } catch (err: any) {
    if (err?.code === 401 || err?.code === 403) {
      errorCode.value = err.code
    }
    console.warn('[UserLoginPage] error', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
#UserLoginPage a {
  text-decoration: underline;
}

#UserLoginPage {
  height: 100%;
  background: url(./../assets/img/login_bg.jpg) no-repeat center center fixed;
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.3);
  background-blend-mode: multiply;

  .section {
    align-items: center;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQYV2NkYGD4z8DAwMgABXAGNgGwSgwVAFbmAgXQdISfAAAAAElFTkSuQmCC)
      repeat;
  }
}

.login-form {
  background: white;
  width: 100%;
  max-width: 400px;
  margin: 40px auto;
  box-shadow: var(--bs-box-shadow-lg-darker);
  border-radius: var(--border-radius-md);

  form {
    border-radius: 2px;
  }

  .header {
    border-top-left-radius: var(--border-radius-md);
    border-top-right-radius: var(--border-radius-md);
    background-color: var(--impresso-color-yellow);
  }

  .footer {
    background: #f4f5f6;
    border-bottom-left-radius: var(--border-radius-md);
    border-bottom-right-radius: var(--border-radius-md);
  }
}

.form-signin {
  .form-control:focus {
    position: relative;
    z-index: 2;
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "login_title": "Log in",
    "login_remember": "Remember me",
    "login_button": "Log in",
    "login_button_loading": "Logging in…",
    "signup_button": "Register",
    "emailAddress": "Email address",
    "password": "Password",
    "emailAddressPlaceholder": "Enter you email address ...",
    "passwordPlaceholder": "Enter your password ...",
    "forgotPassword": "Did you forget your password?",
    "needAccount": "Do you need an account?",
    "anyQuestions": "Any Questions?",
    "contactUs": "Contact us at",
    "accountPendingTitle": "Your account is pending activation",
    "accountPendingBody": "Your credentials are correct, but our staff still need to activate your account. We'll email you as soon as it's ready, usually within a couple of working days.",

    "loginFailedBody": "The email address or password you entered is incorrect. Please try again.",
    "loginFailed": "Login failed"
  }
}
</i18n>
