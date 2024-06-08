<template lang="html">
  <ul class="nav-tabs tabbed-nav pl-2 pt-1 align-items-end">
    <b-nav-item v-for="(t, i) in tabs"
      v-bind:key="i"
      class="small-caps"
      v-on:click="toggle(t)"
      v-bind:active="t === tab"
      v-bind:disabled="t.disabled">
      {{t.label}}
    </b-nav-item>
  </ul>
</template>

<script>
/**
 * @deprecated Not used anywhere
 */

/*
<template lang="html">
  <div class="container">
    <base-tabs v-model="tab" v-bind:tabs="tabs"></base-tabs>
    <div v-for="t in tabs" v-show="t === tab">
      {{t}}
    </div>
  </div>
</template>

<script>
import BaseTabs from './base/BaseTabs';

export default {
  data: () => ({
    tab: {},
    tabs: [
      {
        label: 'thijs',
      },
      {
        label: 'daniele',
        disabled: true,
      },
      {
        label: 'paul',
        active: true,
      },
    ],
  }),
  components: {
    BaseTabs,
  },
  ...

*/
export default {
  props: ['tabs', 'modelValue'],
  emits: ['modelValue:updated'],
  methods: {
    toggle(tab) {
      this.$emit('modelValue:updated', tab);
    },
  },
  mounted() {
    this.toggle(this.tabs.find(d => d.active) || this.tabs[0]);
  },
  computed: {
    tab() { return this.modelValue }
  }
};
</script>
