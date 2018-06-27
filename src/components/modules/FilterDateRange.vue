<template lang="html">
  <filter-wrapper v-bind:title="$t('daterange')" v-on:remove="remove">
    <div slot="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="p-2">
      <div class="body">
        <v-date-picker
          mode="range"
          v-model="selectedDate"
          show-caps>
            <b-form-input
              slot-scope='props'
              v-on:change.native='props.updateValue($event.target.value)'
              v-bind:value="props.inputValue"
              type="text"
              placeholder="Enter your name"></b-form-input>
        </v-date-picker>
      </div>
    </div>
  </filter-wrapper>
</template>

<script>
import Vue from 'vue';
import VCalendar from 'v-calendar';
import 'v-calendar/lib/v-calendar.min.css';

import Daterange from '@/models/Daterange';

import FilterWrapper from './FilterWrapper';

// Use v-calendar, v-date-picker & v-popover components
Vue.use(VCalendar, {
  firstDayOfWeek: 2, // Monday
});

export default {
  data: () => ({
    options: [
      {
        value: 'include',
        text: 'Include',
      },
      {
        value: 'exclude',
        text: 'Exclude',
      },
    ],
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    updateFilter() {
      this.$emit('input', this.filter);
    },
    submitFilter() {
      this.$emit('submit');
    },
    remove() {
      this.$emit('remove');
    },
  },
  computed: {
    selectedDate: {
      get() {
        return new Daterange(this.filter.daterange);
      },
      set(daterange) {
        this.filter.daterange = new Daterange(daterange);
        this.updateFilter();
      },
    },
  },
  components: {
    FilterWrapper,
  },
};
</script>

<style lang="css">
</style>
