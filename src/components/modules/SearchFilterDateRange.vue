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
  props: {
    dateStart: {
      type: [String, Number],
      required: true,
    },
    dateEnd: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    y1: {
      get() {
        return this.dateStart;
      },
      set(value) {
        this.$emit('changeDateStart', value);
      },
    },
    y2: {
      get() {
        if (this.dateEnd < this.dateStart) {
          return this.dateStart;
        }

        return this.dateEnd;
      },
      set(value) {
        this.$emit('changeDateEnd', value);
      },
    },
  },
};
</script>

<style lang="css">
</style>
