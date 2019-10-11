<template>
  <div class="px-2 pb-2 py-2 container">

    <!-- title and type -->
    <div class="row justify-content-between">
      <div class="col-auto align-self-start">
        <h3 v-if="type !== 'collection'">{{title}}</h3>
        <dropdown v-if="type === 'collection'" 
                  :options="options"
                  :value="value"
                  @input="setValue"
                  variant="light"/>
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

}
</i18n>