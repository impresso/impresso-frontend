<template lang="html">
  <div class="filter">
    <div class="row">
      <div class="col">
        <b-form-group label="Start">
          <b-form-input type="number" id="y1" v-model="y1"></b-form-input>
        </b-form-group>
      </div>
      <div class="col">
        <b-form-group label="End">
          <b-form-input type="number" id="y2" v-model="y2"></b-form-input>
        </b-form-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    y1: {
      get() {
        return 1650;
      },
      set(val) {
        console.log(val);
      },
    },
    y2: {
      get() {
        return 1950;
      },
      set(val) {
        console.log(val);
      },
    },
  },
};
</script>

<style lang="css">
</style>
