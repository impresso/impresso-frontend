<template lang="html">
  <main id="UserDashboard">
    <b-container>
      <b-row>
        <b-col>
          <h1 class="mt-5">Dashboard</h1>
          <b-form @submit="onSubmit" v-if="profile.uid">
            <b-form-group
              id="input-group-1"
              label="Email address:"
              label-for="input-1"
              description="We'll never share your email with anyone else."
            >
              <b-form-input
                id="input-1"
                v-model="profile.email"
                type="email"
                required
                placeholder="Enter email"
              ></b-form-input>
            </b-form-group>

            <b-row>
              <b-col>
                <b-form-group id="input-group-2" :label="$t('form_firstname')" label-for="input-2">
                  <b-form-input
                    id="input-2"
                    v-model="profile.firstname"
                    required
                    placeholder="Enter name"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group id="input-group-3" :label="$t('form_lastname')" label-for="input-3">
                  <b-form-input
                    id="input-3"
                    v-model="profile.lastname"
                    required
                    placeholder="Enter name"
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-form-group id="input-group-4" :label="$t('form_pattern')" label-for="input-4">
              <b-form-input
                id="input-4"
                v-model="profile.pattern"
                placeholder="Enter name"
              ></b-form-input>
            </b-form-group>

          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
export default {
  data: () => ({
    profile: Object,
  }),
  methods: {
    onSubmit() {
      console.info('UserPage.onSubmit()');
    },
  },
  computed: {
    patterns() {
      return this.profile.patterns.split(',');
    },
  },
  async mounted() {
    this.profile = await this.$store.dispatch('user/GET_PROFILE');
    console.info('UserPage mounted.',  this.profile);
  },
};
</script>

<style scoped lang="less">
</style>
