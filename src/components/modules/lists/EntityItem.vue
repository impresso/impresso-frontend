<template>
  <div class="entity-item d-flex align-items-center" :class="{ active }">
    <div class="mb-2 mr-3" v-if="wikidataImages.length">
      <img :src="getWikidataImageURL(wikidataImages[0], { width: 60 })" />
    </div>
    <div class="flex-grow-1">
      <!-- label, i.e the name -->
      <router-link v-if="showLink" v-bind:class="{ active: active }" v-bind:to="itemUrl">
        <span v-html="name"></span>
      </router-link>
      <div v-else v-html="name" />

      <!-- description and other metadata -->
      <div class="type badge ml-1 bg-medium badge-light">{{ $t(`types.${item.type}`) }}</div>
      <div v-if="description" v-html="description" />
      <div class="small-caps" v-if="item.countItems > -1">
        <span v-html="countItems"></span>,
        <span v-html="countMentions"></span>
      </div>
    </div>
    <div v-if="isObservable" class="px-2" @click="$emit('toggle-observed', item)">
      <div class="item-observed" :class="{ active: observed }">
        <div class="icon dripicons-preview" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    observed: Boolean,
    isObservable: Boolean,
    active: Boolean,
    showLink: Boolean,
    item: {
      type: Object
    }
  },
  computed: {
    name() {
      return this.item.name.split('_').join(' ')
    },
    description() {
      if (!this.item.wikidata || !this.item.wikidata.descriptions) {
        return null
      }
      return this.item.wikidata.descriptions.en
    },
    itemUrl() {
      return {
        name: 'entity',
        query: this.$route.query,
        params: {
          entity_id: this.item.uid
        }
      }
    },
    wikidataImages() {
      if (!this.item.wikidata) {
        return []
      }
      return this.item?.wikidata?.images || []
    },
    countItems() {
      return this.$tc('countItems', this.item.countItems, {
        count: `<span class="number">${this.$n(this.item.countItems)}</span>`
      })
    },
    countMentions() {
      return this.$tc('countMentions', this.item.countMentions, {
        count: `<span class="number">${this.$n(this.item.countMentions)}</span>`
      })
    }
  },
  methods: {
    getWikidataImageURL(image, { width = 60 } = {}) {
      return `http://commons.wikimedia.org/wiki/Special:FilePath/${image.value}?width=${width}px`
    }
  }
}
</script>

<style lang="scss" scoped>
.topic-matches {
  border-left: 2px solid gold;
}
.item-observed {
  cursor: pointer;
  width: 1.25rem;
  height: 1.25rem;
  text-align: center;
  & > div {
    color: #ccc;
  }
  &.active > div {
    color: blue;
  }
}
.entity-item.active {
  box-shadow: inset 0.15em 0 #343a40;
  background-color: #f2f2f2;
}
</style>
<i18n lang="json">
{
  "en": {
    "countItems": "no articles | {count} article | {count} articles",
    "countMentions": "no mentions | {count} mention | {count} mentions"
  }
}
</i18n>
