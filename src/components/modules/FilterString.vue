<template lang="html">
  <filter-wrapper v-on:remove="remove">
    <div slot="context">
      <i-dropdown
      v-model="filter.context"
      v-bind:options="options"
      v-on:input="submitFilter"
      size="sm" />
    </div>
    <b-input
      type="text"
      v-model="filter.query"
      v-on:input.native="updateFilter"
      v-on:keyup.enter.native="submitFilter"
      v-bind:disabled="disabled"
      size="sm"
    />
    <div slot="controls">
      <b-button v-on:click="editFilter" variant="link" v-show="disabled" size="sm"><icon name="edit" /></b-button>
      <b-button v-on:click="submitFilter" variant="link" v-show="!disabled" size="sm"><icon name="check" /></b-button>
    </div>
  </filter-wrapper>
</template>

<script>
import FilterFactory from '@/models/FilterFactory';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/edit';
import 'vue-awesome/icons/check';

import FilterWrapper from './FilterWrapper';

export default {
  data: () => ({
    options: [{
      value: 'include',
      text: 'Include',
    },
    {
      value: 'exclude',
      text: 'Exclude',
    }],
    disabled: true,
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    updateFilter() {
      this.$emit('input', FilterFactory.create(this.filter));
    },
    submitFilter() {
      this.$emit('submit');
      this.disabled = true;
    },
    remove() {
      this.$emit('remove');
    },
    editFilter() {
      this.disabled = false;
    },
  },
  components: {
    FilterWrapper,
    Icon,
  },
};
</script>

<style lang="css">
</style>

<i18n>
{
  "en": {
    "query": "Text",
    "edit": "Edit",
    "save": "Save"
  },
  "fr": {
    "query": "Texte"
  },
  "nl": {
    "query": "Tekst",
    "edit": "Bewerken",
    "save": "Opslaan"
  }
}
</i18n>
