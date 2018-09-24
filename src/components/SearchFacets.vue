<template lang="html">
  <div id="search-facets">
    <div v-for="facet in facets">
      <div class="pb-4">
        <base-title-bar>{{$t(`label_${facet.type}`)}}
          <template slot="actions">
            <b-button class="float-right" size="sm" variant="outline-secondary" v-on:click="submit">
              Apply
            </b-button>
          </template>
        </base-title-bar>
        <b-form-group>
          <b-form-checkbox-group
            stacked
            v-model="selected[facet.type]"
            v-bind:name="facet.type"
            v-bind:options="transform(facet.buckets)">
          </b-form-checkbox-group>
        </b-form-group>
      </div>
    </div>
  </div>
</template>

<script>
import FilterFactory from '@/models/FilterFactory';
import BaseTitleBar from './base/BaseTitleBar';

export default {
  data: () => ({
    selected: {},
  }),
  computed: {
    facets: {
      get() {
        return this.$store.getters['search/facets'];
      },
    },
  },
  methods: {
    transform(buckets) {
      return buckets.map(bucket => ({
        text: `${bucket.item.name || bucket.val} (${bucket.count})`,
        value: bucket,
      }));
    },
    submit() {
      Object.keys(this.selected).forEach((key) => {
        this.$store.commit('search/ADD_FILTER', FilterFactory.create({
          buckets: this.selected[key],
          type: key,
        }));
      });
      this.$emit('submit');
    },
  },
  components: {
    BaseTitleBar,
  },
};
</script>

<style lang="less">
</style>

<i18n>
{
  "en": {
    "label_newspaper": "Newspaper Title",
    "label_year": "Year",
    "label_language": "Language"
  },
  "nl": {
    "label_newspaper": "Krant",
    "label_year": "Jaar",
    "label_language": "Taal"
  }
}
</i18n>
