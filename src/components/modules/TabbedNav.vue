<template lang="html">
  <b-nav tabs class="tabbed-nav pl-2 pt-1 align-items-end">
    <b-nav-item v-for="t in tabs"
      class="small-caps"
      v-on:click="setActiveTab(t)"
      v-bind:active="activeTab === t"
      v-bind:disabled="t.disabled"
      ><span v-html="t.label"></span></b-nav-item>
  </b-nav>
</template>

<script>
export default {
  /*
  Usage:
  <tabbed-nav v-model="tabs"></tabbed-nav>

  Where tabs is a list of objects {label,active,disabled} like:
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
  */
  props: ['tabs'],
  model: {
    prop: 'tabs',
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
      this.tabs.forEach((t) => {
        t.active = t === tab;
      });
    },
  },
  data: () => ({
    activeTab: '',
  }),
  mounted() {
    const activeTab = this.tabs.find(d => d.active);
    this.activeTab = activeTab || this.tabs[0];
  },
};
</script>

<style scoped lang="scss">
  .tabbed-nav {
    min-height: 54px;
  }
</style>
