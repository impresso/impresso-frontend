<template>
  <b-dropdown size="sm" variant="outline-primary" class="mr-1 mb-1 recommender-pill">
    <template v-slot:button-content>
      <span class="button-icon dripicons-checkmark"/>
      <span class="label sp-string sp-title crossed-out">
        boing boing
      </span>
    </template>
    <b-dropdown-form>
      <!-- toggles bar -->
      <b-row>
        <b-col>
          <b-form-checkbox
            v-model="recommenderEnabled"
            size="sm"
            switch>
            Enable this recommender
          </b-form-checkbox>
        </b-col>
      </b-row>

      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis, eligendi amet? At debitis ad expedita molestias non eligendi iusto impedit nobis tempore modi sequi fuga, maiores veritatis iure architecto alias.
      </div>
    </b-dropdown-form>
  </b-dropdown>
</template>

<script>
export default {
  computed: {
    recommenderEnabled: {
      get() { return true },
      set(value) { console.log('Enable recommender', value) }
    }
  }
}
</script>

<style lang="scss">
  .recommender-pill {
    .button-icon {
      vertical-align: middle;
    }
    .button-text {
      &.crossed-out {
        text-decoration: line-through;
      }
    }
  }
</style>