<template lang="html">
  <b-dropdown
    size="sm" variant="outline-secondary">
    <template v-slot:button-content>
      <div v-if="selectedCollection" class="text-left d-inline-block">
        <strong class="d-block limit-text">{{selectedCollection.name}}</strong>
        <div v-if="selectedCollection.description" class="limit-text">{{selectedCollection.description}}</div>
        {{$t('dates.lastModifiedDate')}} {{$d(selectedCollection.lastModifiedDate, 'short')}}
      </div>
      <span v-else v-html="$t('actions.select_collection')" />
    </template>
    <b-dropdown-item v-for="(c, i) in collections"
      @click="setCollectionId(c.uid)"
      :active="active === c.uid">
      <item-label :item="c" type="collection" hideuser />
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import ItemLabel from '../modules/lists/ItemLabel';

export default {
  props: {
    collections: {
      type: Array,
      default() { return []; },
    },
    active: String,
  },
  components: {
    ItemLabel,
  },
  computed: {
    selectedCollection() {
      return this.collections.find(c => c.uid === this.active);
    },
    collectionDropdownTitle() {
      const cid = this.collections.find(c => c.uid === this.active);
      return cid ? cid.name : this.$t('actions.select_collection');
    },
  },
  methods: {
    setCollectionId(id) {
      this.$emit('input', id);
    },
  },
};
</script>

<style lang="scss" scoped>
  .limit-text {
    max-width: 418px;
    overflow:hidden;
    text-overflow: ellipsis;
  }
</style>
