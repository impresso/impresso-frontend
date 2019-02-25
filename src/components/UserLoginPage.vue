<template lang="html">
  <i-layout id="UserLoginPage">
    <i-layout-section class="section">
      <div class="login-form">
        <form v-on:submit.prevent="authenticate" class="form-signin">
          <div class="header p-3">
            {{$t("login_title")}}
          </div>
          <div class="body py-4 px-3">
            <div class="alert alert-danger" v-show="error" role="alert">
              {{error}}
            </div>
            <label for="inputEmail" class="sr-only">Email address</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              required
              autofocus
              v-bind:autocomplete="autocomplete()">
            <label for="inputPassword" class="sr-only">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Password"
              required
              v-bind:autocomplete="autocomplete()">
            <div class="checkbox mb-3">
              <label>
                <input type="checkbox" value="remember-me" v-model="rememberCredetials"> {{$t("login_remember")}}
              </label>
            </div>
          </div>
          <div class="footer p-3">
            <button class="btn btn-lg btn-primary btn-block" type="submit">{{$t("login_button")}}</button>
          </div>
        </form>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import BaseTitleBar from './base/BaseTitleBar';

export default {
  data: () => ({
    email: '',
    password: '',
    error: false,
  }),
  methods: {
    autocomplete() {
      return this.rememberCredetials === true ? 'on' : 'off';
    },
    authenticate() {
      this.error = false;
      this.$store.dispatch('user/LOGIN', {
        email: this.email,
        password: this.password,
      }).then(() => {
        this.$router.push({
          name: 'home',
        });
      }, (err) => {
        this.error = this.$t(err.message);
      });
    },
  },
  computed: {
    rememberCredetials: {
      get() {
        return this.$store.state.user.rememberCredetials;
      },
      set(val) {
        this.$store.commit('user/SET_REMEMBER_CREDENTIALS', {
          remember: val,
        });
      },
    },
  },
  components: {
    BaseTitleBar,
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#UserLoginPage{
  height: 100%;
  background: url(./../assets/img/desk_still_life.jpg) no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-color: rgb(81, 218, 237);
  background-blend-mode:soft-light;
  .section{
    align-items: center;
  }
};

.login-form{
  background: white;
  width: 100%;
  max-width: 330px;
  margin: 40px auto;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
  .header{
    background: $clr-accent-light;
    font-weight: bold;
    font-size: larger;
  }

  .body{

  }

  .footer{
    background: #f4f5f6;
  }
}

.form-signin {
  .form-control:focus {
    position: relative;
    z-index: 2;
  }
  input[type="email"] {
    margin-bottom: -1px;
  }
  input[type="password"] {
    margin-bottom: 10px;
  }
}
</style>

<i18n>
{
  "en": {
    "Invalid login": "Invalid login",
    "login_title": "Please sign in",
    "login_remember": "Remember me",
    "login_button": "Sign in"
  },
  "nl": {
    "Invalid login": "Onjuiste login",
    "login_title": "Inloggen",
    "login_remember": "Onthouden",
    "login_button": "Inloggen"
  }
}
</i18n>
