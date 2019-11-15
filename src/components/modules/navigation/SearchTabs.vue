<template>
  <b-tabs pills class="mx-2 pt-2">
    <template v-slot:tabs-end>
      <b-nav-item
        :class="`pl-1 ${classSearch}`"
        active-class='none'
        :to="{ name:'search'}"><span v-html="$t('tabs.text')"/></b-nav-item>
      <b-nav-item
        :class="classImages"
        active-class='none'
        :to="{ name:'searchImages'}"><span v-html="$t('tabs.images')"/></b-nav-item>
      <b-nav-item
        :class="classNgrams"
        active-class='none'
        :to="{ name:'searchNgrams'}"><span v-html="$t('tabs.ngrams')"/></b-nav-item>
    </template>
  </b-tabs>
</template>

<script>
export default {
  computed: {
    classSearch() { return this.activeClassFor('search'); },
    classImages() { return this.activeClassFor('searchImages'); },
    classNgrams() { return this.activeClassFor('searchNgrams'); },
  },
  methods: {
    isActive(pageName) {
      return this.$router.currentRoute.name === pageName;
    },
    activeClassFor(pageName) {
      return this.isActive(pageName) ? 'active' : '';
    },
  },
};
</script>

<i18n>
  {
    "en": {
      "tabs": {
        "text": "search articles",
        "images": "search images",
        "ngrams": "ngrams"
      }
    }
  }
</i18n>
