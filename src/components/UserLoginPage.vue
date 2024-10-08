<template>
  <i-layout id="UserLoginPage">
    <i-layout-section class="section">
      <div class="login-form">
        <form v-on:submit.prevent="authenticate" class="form-signin">
          <div class="header p-3">
            {{ $t('login_title') }}
          </div>
          <div class="body py-4 px-3">
            <div class="alert alert-danger" v-show="error" role="alert">
              {{ error }}
            </div>
            <label for="inputEmail" class="sr-only">Email address</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              placeholder="Email address"
              required
              autofocus
              v-bind:autocomplete="autocomplete()"
            />
            <label for="inputPassword" class="sr-only">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Password"
              required
              v-bind:autocomplete="autocomplete()"
            />
            <div class="checkbox">
              <label>
                <input type="checkbox" value="remember-me" v-model="rememberCredentials" />
                {{ $t('login_remember') }}
              </label>
            </div>

            <div class="footer mb-3">
              <button class="btn btn-md btn-primary btn-block" type="submit">
                {{ $t('login_button') }}
              </button>
            </div>
            <!-- Password forgotten -->

            <p class="mb-0">
              Did you forget your password? <br />
              <router-link :to="{ name: 'passwordReset' }" v-html="$t('actions.resetMyPassword')" />
            </p>
          </div>
          <div class="footer p-3">
            <h5>Do you need an account?</h5>
            <router-link to="register" class="btn btn-sm btn-outline-primary btn-block">{{
              $t('signup_button')
            }}</router-link>
            <p class="mt-3">
              Any Questions? <br />Contact us at
              <a href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>
            </p>
          </div>
        </form>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import { mapStores } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  data: () => ({
    email: '',
    password: '',
    error: false,
  }),
  methods: {
    autocomplete() {
      return this.rememberCredentials === true ? 'on' : 'off'
    },
    authenticate() {
      this.error = false
      const path = this.$route.query.redirect || window.redirect || '/'

      this.userStore
        .login({
          email: this.email,
          password: this.password,
        })
        .then(() => {
          this.$router.push({
            path,
            ...this.userStore.redirectionParams,
          })
        })
        .catch(err => {
          if (err.code === 401) {
            this.error = this.$t('errors.LoginFailed')
          }
          console.warn('error', err)
        })
    },
  },
  computed: {
    ...mapStores(useUserStore),
    rememberCredentials: {
      get() {
        return this.userStore.rememberCredentials
      },
      set(val) {
        this.userStore.setRememberCredentials(val)
      },
    },
  },
  components: {},
}
</script>

<style scoped lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

#UserLoginPage a {
  text-decoration: underline;
}
#UserLoginPage {
  height: 100%;
  background: url(./../assets/img/login_bg.jpg) no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
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
  max-width: 350px;
  margin: 40px auto;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);

  .header {
    background: $clr-accent-light;
    font-weight: bold;
    font-size: larger;
  }

  .footer {
    background: #f4f5f6;
  }

  form {
    border-radius: 2px;
  }
}

.form-signin {
  .form-control:focus {
    position: relative;
    z-index: 2;
  }
  input[type='email'] {
    margin-bottom: -1px;
  }
  input[type='password'] {
    margin-bottom: 10px;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "Invalid login": "Invalid login",
    "login_title": "Please sign in",
    "login_remember": "Remember me",
    "login_button": "Sign in",
    "signup_button": "Sign up!"
  },
  "nl": {
    "Invalid login": "Onjuiste login",
    "login_title": "Inloggen",
    "login_remember": "Onthouden",
    "login_button": "Inloggen"
  }
}
</i18n>
