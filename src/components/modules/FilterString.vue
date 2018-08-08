<template lang="html">
  <filter-wrapper v-bind:title="$t('query')" v-on:remove="remove">
    <div slot="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="p-2">
      <b-input-group>
       <b-input ref="filter" type="text" v-model="filter.query" v-on:input="updateFilter" v-on:keyup.enter.native="submitFilter" v-bind:disabled="disabled" />
       <b-input-group-append>
         <b-btn v-on:click="toggleFilter" variant="info" v-show="disabled">{{$t('edit')}}</b-btn>
         <b-btn v-on:click="toggleFilter" variant="success" v-show="!disabled">{{$t('save')}}</b-btn>
       </b-input-group-append>
     </b-input-group>
    </div>
  </filter-wrapper>
</template>

<script>
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
      this.$emit('input', this.filter);
    },
    submitFilter() {
      this.$emit('submit');
    },
    remove() {
      this.$emit('remove');
    },
    toggleFilter() {
      this.disabled = !this.disabled;
    },
  },
  components: {
    FilterWrapper,
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
