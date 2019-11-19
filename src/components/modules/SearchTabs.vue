<template lang="html">
  <b-tabs pills class="mx-2 pt-2">
    <template v-slot:tabs-end>
      <b-nav-item v-for="tab in tabs" v-bind:key="tab" active-class='none'
        :class="{ active: isActive(tab) }"
        :to="{ name: tab }"><span v-html="$t(`tabs.${tab}`)"/>
      </b-nav-item>
    </template>
  </b-tabs>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      default: () => ['search', 'searchImages'],
    },
  },
  methods: {
    isActive(tab) {
      return this.$route.name === tab;
    },
  },
};
</script>

<style lang="css" scoped>
</style>

<i18n>
{
  "en": {
    "tabs": {
      "search": "search articles",
      "searchImages": "search images"
    }
  }
}
</i18n>
