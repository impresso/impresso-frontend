<template>
  <filter-wrapper v-on:remove="remove" v-bind:title="filter.query" :id="filter.key">
    <template v-slot:settings>
      <div class="input-group mb-3">
        <b-input type="text" :modelValue="filter.query" v-on:input="updateFilter" v-on:keyup.enter="submitFilter"
          v-bind:disabled="disabled" size="sm" />
        <b-button v-on:click="editFilter" v-show="disabled" size="sm">
          <icon name="edit" />
        </b-button>
        <b-button v-on:click="submitFilter" v-show="!disabled" size="sm">
          <icon name="check" />
        </b-button>
      </div>
      <i-layout>
        <i-layout-section width="50%">
          <filter-setting-context :modelValue="filter" />
        </i-layout-section>
        <i-layout-section>
          <filter-setting-precision :modelValue="filter" />
        </i-layout-section>
      </i-layout>
    </template>
  </filter-wrapper>
</template>

<script>
/**
 * @deprecated Not used anywhere.
 */

import Icon from '@/components/base/Icon.vue'
import FilterFactory from '@/models/FilterFactory'

import FilterSettingContext from '@/components/modules/FilterSettingContext.vue'
import FilterSettingPrecision from '@/components/modules/FilterSettingPrecision.vue'
import FilterWrapper from '@/components/modules/FilterWrapper.vue'

export default {
  data: () => ({
    disabled: true,
  }),
  props: ['filter'],
  methods: {
    updateFilter() {
      this.$emit('input', FilterFactory.create(this.filter))
    },
    submitFilter() {
      this.$emit('submit')
      this.disabled = true
    },
    remove() {
      this.$emit('remove')
    },
    editFilter() {
      this.disabled = false
    },
  },
  components: {
    FilterWrapper,
    FilterSettingContext,
    FilterSettingPrecision,
    Icon,
  },
}
</script>

<i18n lang="json">{
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
}</i18n>
