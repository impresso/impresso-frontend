<template lang="html">
    <div class="row">
      <div class="col-6">
        <b-form-input v-model="startDate" ></b-form-input>
        <label>{{ $d(daterange.start, 'long') }} </label>

      </div>
      <div class="col-6">
        <b-form-input v-model="endDate"></b-form-input>
        <label>{{ $d(daterange.end, 'long') }}</label>

      </div>
    </div>
</template>

<script>
import Daterange from '@/models/Daterange';

export default {
  props: {
    daterange: {
      type: Object,
    },
  },
  computed: {
    startDate: {
      get() {
        return this.daterange.start.toISOString().split('T').shift();
      },
      set(start) {
        this.updateDaterange({ start });
      },
    },
    endDate: {
      get() {
        return this.daterange.end.toISOString().split('T').shift();
      },
      set(end) {
        this.updateDaterange({ end });
      },
    },
  },
  methods: {
    updateDaterange({ start, end }) {
      const reg = /^\d{4}-[0-1]\d-[0-3]\d$/;
      let item;
      // if value is complete, should be a valid YYYY-MM-dd date.
      if (start && reg.test(start)) {
        const d = new Date(start);
        if (!isNaN(d.valueOf())) {
          item = new Daterange({
            start: d,
            end: this.daterange.end,
          });
        }
      } else if (end && reg.test(end)) {
        const d = new Date(end);
        if (!isNaN(d.valueOf())) {
          item = new Daterange({
            start: this.daterange.start,
            end: d,
          });
        }
      }
      item.uid = item.getValue();
      if (item && item.uid !== this.daterange.uid) {
        item.checked = this.daterange.checked;

        console.log('updateDaterange emit "change" \n', this.daterange.uid, '\nto:\n', item.getValue());
        this.$emit('change', {
          item,
          uid: this.daterange.uid,
        });
      }
    },
  },
  components: {
  },
};
</script>

<style lang="scss" scoped>
label{
  font-variant: none;
}
</style>
