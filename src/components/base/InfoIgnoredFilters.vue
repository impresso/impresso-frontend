<template lang="html">
  <div class="InfoIgnoredFilters" v-if="ignoredFilters.length">
    <em class="small" v-html="$tc('numbers.ignoredFilters', ignoredFilters.length, {
      n: ignoredFilters.length,
    })"/>
    &nbsp;
    <InfoButton name="limited-search-filters" />
    <ul>
      <li v-for="(f, i) in ignoredFilters" :key="i" class="small-caps">
        <span :title="$tc(`label.${f.type}.title`)">
          {{$tc(`label.${f.type}.title`)}}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import InfoButton from './InfoButton.vue'

export default {
  props: {
    ignoredFilters: {
      type: Array,
      default() { return []; }
    },
    infoButtonName: {
      type: String,
      default: 'limited-search-filters'
    }
  },
  components: {
    InfoButton
  }
}
</script>

<style lang="css" scoped>

</style>
