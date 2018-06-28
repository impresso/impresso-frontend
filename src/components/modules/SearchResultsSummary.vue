<template lang="html">
  <div>{{$t("found")}} {{totalRows}} articles {{daterange}}</div>
</template>

<script>
export default {
  props: ['components', 'totalRows'],
  computed: {
    daterange: {
      get() {
        const dateranges = this.components
          .filter(d => d.type === 'daterange')
          .map(d => d.daterange);

        if (!dateranges.length) {
          return '';
        }
        return `between ${dateranges.join(' and ')}`;
      },
    },
    fulltext: {
      get() {
        const dateranges = this.components
          .filter(d => d.type === 'string')
          .map(d => d.daterange);

        if (!dateranges.length) {
          return '';
        }
        return `between ${dateranges.join(' and ')}`;
      },
    },
  },
};
</script>

<style scoped lang="css">
</style>
<i18n>
{
  "en": {
    "found": "Found"
  },
  "nl": {
    "found": "Gevonden"
  }
}
</i18n>
