<template lang="html">
  <main id="UserLoginPage">
    <form v-on:submit.prevent="authenticate" class="form-signin mt-5">
      <h1>Please sign in</h1>
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
          <input type="checkbox" value="remember-me" v-model="rememberCredetials"> Remember me
        </label>
      </div>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    </form>
  </main>
</template>

<script>
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
          path: 'dashboard',
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
};
</script>

<style scoped lang="less">
.form-signin {
    width: 100%;
    max-width: 330px;
    margin: auto;
    text-align: center;
}
.form-signin .form-control:focus {
    position: relative;
    z-index: 2;
}
.form-signin input[type="email"] {
    margin-bottom: -1px;
}
.form-signin input[type="password"] {
    margin-bottom: 10px;
}
</style>

<i18n>
{
  "en": {
    "Invalid login": "Invalid login"
  },
  "nl": {
    "Invalid login": "Onjuiste login"
  }
}
</i18n>
