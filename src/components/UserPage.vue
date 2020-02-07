<template lang="html">
  <main id="UserDashboard">
    <b-container>
      <b-row>
        <b-col>
          <div class="d-flex align-items-center my-5">
            <div class="colors-wrapper flex-shrink-1">
              <div v-if="user">
                <div class="color" v-for="color in user.colors" v-bind:key="color" :style="getColorBandStyle(color)"></div>
              </div>
            </div>
            <div class="ml-4">
              <h1 class="user-fullname  m-0 sans font-weight-bold">
                {{ user.firstname }} {{ user.lastname }}
              </h1>
              <div class="user-displayname small-caps">
                {{ user.displayName }}
              </div>
            </div>
          </div>
          <b-form @submit.prevent="onSubmit" v-if="user.uid">
            <b-form-group
              id="input-group-1"
              label="Email address:"
              label-for="email"
              description="We'll never share your email with anyone else."
            >
              <b-form-input
                id="email" name="email" autocomplete="home email"
                v-model="user.email"
                type="email"
                required
                placeholder="Enter email"
              ></b-form-input>
            </b-form-group>

            <b-row>
              <b-col>
                <b-form-group id="input-group-2" :label="$t('form_firstname')" label-for="firstname">
                  <b-form-input
                    id="firstname" name="firstname" autocomplete="firstname"
                    v-model="user.firstname"
                    required
                    placeholder="Enter name"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group id="input-group-3" :label="$t('form_lastname')" label-for="lastname">
                  <b-form-input
                    id="lastname" name="lastname" autocomplete="lastname"
                    v-model="user.lastname"
                    required
                    placeholder="Enter name"
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-form-group id="input-group-4" :label="$t('form_pattern')" label-for="input-4">
              <b-form-input
                id="input-4"
                v-model="patternAsText"
                placeholder="Enter name"
              ></b-form-input>
            </b-form-group>


            <b-form-group id="input-group-4" :label="$t('form_displayname')" label-for="input-4">
              <b-form-input
                id="input-4"
                v-model="user.displayName"
                placeholder="Enter name"
              ></b-form-input>
              <slot name="description">
                <span v-html="$t('form_displayname_description')"/>
              </slot>
            </b-form-group>

            <b-button size="sm" type='submit' variant="outline-primary">Small Button</b-button>
          </b-form>
        </b-col>
      </b-row>

      <h2 class="border-bottom mt-5 mb-3 pb-3">{{ $t('form_change_password') }}</h2>
      <b-row class="mb-5">
        <b-col>
          <b-form @submit.prevent="onSubmitChangePassword">
            <!-- current password -->
            <b-form-group id="input-group-changepwd-1" :label="$t('form_oldpassword')" label-for="current-password">
              <b-form-input
                id="current-password" name="current-password"
                v-model="oldPassword"
                placeholder="(current password)"
              ></b-form-input>
              <slot name="description">
                <p class="description pt-2 small" v-html="$t('form_oldpassword_description')"/>
              </slot>
            </b-form-group><!-- current password -->
            <!-- new password -->
            <b-form-group id="input-group-changepwd-2" :label="$t('form_pattern')" label-for="password">
              <b-form-input
                id="password" name="password"
                v-model="newPassword"
                placeholder="(new password)"
              ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-changepwd-3" :label="$t('form_pattern')" label-for="repeat-password">
              <b-form-input
                id="repeat-password" name="repeat-password"
                v-model="repeatPassword"
                placeholder="(repeat new password)"
              ></b-form-input>
            </b-form-group><!-- new password -->

            <b-button size="sm" type='submit' variant="outline-primary">{{ $t('actions.changePassword') }}</b-button>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
export default {
  data: () => ({
    user: Object,
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  }),
  methods: {
    onSubmitChangePassword() {
      console.info('UserPage.onSubmitChangePassword()');
    },
    onSubmit() {
      console.info('UserPage.onSubmit()');
      // to be checked for validity...
      this.$store.dispatch('user/PATCH_CURRENT_USER', this.user);
    },
    getColorBandStyle(color) {
      const width = this.user.colors.length ? `${(100 / this.user.colors.length)}%` : '0%';
      return {
        'background-color': color,
        width,
      };
    },
  },
  computed: {
    patternAsText: {
      get() {
        if (this.user) {
          return this.user.pattern.join(', ');
        }
        return '';
      },
      set(v) {
        this.user.setPattern(v);
      }
    },
  },
  async mounted() {
    this.user = await this.$store.dispatch('user/GET_CURRENT_USER');
    console.info('UserPage mounted.',  this.user);
  },
};
</script>

<style scoped lang="less">
.colors-wrapper {
  background-color: black;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;

  > div {
    width: 100%;
    height: 100%;
  }
  > div > div.color {
    display: inline-block;
    height: 100%;
  }
}

.user-fullname{
  font-size:1.5rem;
}
.user-displayname{
  font-size:1.25rem;
}
</style>

<i18n>
{
  "en": {
    "form_firstname": "First name",
    "form_lastname": "Last name",
    "form_displayname": "User label",
    "form_displayname_description": "User label"
  }
}
</i18n>
