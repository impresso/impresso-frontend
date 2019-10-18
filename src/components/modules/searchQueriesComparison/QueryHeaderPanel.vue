<template>
  <div class="px-2 pb-2 py-2 container">

    <b-tabs small 
            class="mx-2 pt-2"
            content-class="mt-3" 
            v-if="type !== 'intersection'">
      <!-- query -->
      <b-tab active-class='none'
             :active="type === 'query'"
             :title="$t('tabs.query')"
             @click="typeChanged('query')">
        [query]
      </b-tab>
      <!-- collection -->
      <b-tab active-class='none'
             :active="type === 'collection'"
             :title="$t('tabs.collection')"
             @click="typeChanged('collection')">
        <dropdown :options="options"
                  :value="value"
                  @input="setValue"
                  variant="light"/>
      </b-tab>
    </b-tabs>

    <!-- intersection -->
    <div class="row justify-content-between" v-if="type === 'intersection'">
      <div class="col-auto align-self-start">
        <h3>{{title}}</h3>
      </div>
      <div class="col-auto align-self-start">
        <div v-if="type" class="badge badge-secondary type d-flex">
          <span class="small-caps d-flex">{{type}}</span>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-auto">{{total}} articles</div>
    </div>

  </div>
</template>

<script>
import Dropdown from '../../layout/Dropdown';

export default {
  data: () => ({}),
  props: {
    collection: {
      type: Object, // A `{ title, id }` object where `title` is the name of the collection
    },
    type: String, // `collection` or `intersection`.
    total: Number, // total items in selected collection.
    collections: {
      type: Array, // An array of `{ title, id }` objects for the dropdown box
      default() { return []; },
    },
  },
  components: {
    Dropdown,
  },
  methods: {
    setValue(value) {
      const collection = this.collections.find(c => c.id === value);
      if (collection) {
        this.$emit('collection-selected', collection.id);
      }
    },
    typeChanged(newType) {
      console.info('Type', newType);
      if (newType === 'collection') {
        this.$emit('collection-selected', 'no-collection-selected');
      }
    },
  },
  computed: {
    options() {
      const options = this.collections.map(({ title, id }) => ({ text: title, value: id }));
      if (this.collection && !options.find(o => o.value === this.collection.id)) {
        options.unshift({ text: this.collection.title, value: this.collection.id });
      }
      return options;
    },
    value() {
      return this.collection
        ? this.collection.id
        : undefined;
    },
    title() {
      return this.collection
        ? this.collection.title
        : '';
    },
  },
};
</script>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

  .type {
    .small-caps {
      height: 17px;
      vertical-align: top;
    }
  }
</style>

<i18n>
{
  "en": {
    "tabs": {
      "collection": "Collection",
      "query": "Query"
    }
  }
}
</i18n>