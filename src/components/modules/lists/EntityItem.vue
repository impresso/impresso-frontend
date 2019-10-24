<template lang="html">
  <div class="entity-item item" v-bind:class="{ active: active }">
    <div
      class="mb-2 mr-3 float-left"
      v-if="wikidataImages.length">
      <img :src="getWikidataImageURL(wikidataImages[0], { width: 60})">
    </div>

    <!-- label, i.e the name -->
    <router-link v-if="showLink"
      v-bind:class="{ active: active }"
      v-bind:to="{ name: 'entity', params: {
        entity_id: this.item.uid,
      }}">
      <span v-html="name"></span>
    </router-link>
    <div v-else v-html="name" />

    <!-- description and othe metadata -->
    <div class="type badge ml-1  bg-medium badge-light">{{ $t(`types.${item.type}`) }}</div>
    <div v-if="description" v-html="description"/>
    <div class="small-caps" v-if="item.countItems > -1">
      <span v-html="$tc('countItems', item.countItems, {
        count: $n(item.countItems),
      })"/>,
      <span v-html="$tc('countMentions', item.countMentions, {
        count: $n(item.countMentions),
      })"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
    },
    showLink: {
      type: Boolean,
    },
    item: {
      type: Object,
    },
  },
  computed: {
    name() {
      return this.item.name.split('_').join(' ');
    },
    description() {
      if (!this.item.wikidata || !this.item.wikidata.descriptions) {
        return null;
      }
      return this.item.wikidata.descriptions.en;
    },
    wikidataImages() {
      if (!this.item.wikidata) {
        return [];
      }
      return this.item.wikidata.images || [];
    },
  },
  methods: {
    getWikidataImageURL(image, { width = 60 } = {}) {
      return `http://commons.wikimedia.org/wiki/Special:FilePath/${image.value}?width=${width}px`;
    },
  },
};
</script>

<style lang="css" scoped>
</style>
<i18n>
  {
    "en": {
      "countItems": "no articles | <span class='number'>{count}</span> article | <span class='number'>{count}</span> articles",
      "countMentions": "no mentions | <span class='number'>{count}</span> mention | <span class='number'>{count}</span> mentions"
    }
  }
</i18n>
