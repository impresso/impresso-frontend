<template lang="html">
  <div>
    <b-nav tabs class="tabbed-nav pl-2 pt-1 align-items-end">
      <b-nav-item class="small-caps" :active="true">
        {{$t('searchClustersLabel')}}
      </b-nav-item>
    </b-nav>

    <div class="pt-2">
      <h6 class="label">{{$t('searchInPatternsLabel')}}</h6>
      <search-input class="pt-2" @submit="onSubmitted"/>
    </div>
  </div>
</template>

<script>
import SearchInput from '@/components/modules/SearchInput'

export default {
  data: () => ({
  }),
  components: {
    SearchInput,
  },
  methods: {
    onSubmitted(v) {
      console.info('Search input submitted', v)
    }
  }
};
</script>

<style lang="scss" scoped>
  @import "impresso-theme/src/scss/variables.sass";
  .label {
    font-family: $font-family-sans-serif;
    font-variant: all-small-caps;
  }
</style>

<i18n>
{
  "en": {
    "searchClustersLabel": "search clusters",
    "searchInPatternsLabel": "search in text reuse patterns"
  }
}
</i18n>