<template lang="html">
  <div>
    <div class="subheading">{{$t("summary")}}</div>
    <div class="heading text-serif">
      {{$t("found")}}
      <span class='hg'>{{totalRows}}</span> {{$t("articles")}}

      <span v-html="fulltext"></span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['components', 'totalRows'],
  computed: {
    dateranges: {
      get() {
        const values = this.components
          .filter(d => d.type === 'daterange')
          .map((d) => {
            console.log(d);
            return 'o';
          });

        return `${this.$t('between')} ${values.join(', ')}`;
      },
    },
    fulltext: {
      get() {
        const values = this.components
          .filter(d => d.type === 'string').map((d) => {
            console.log('hey, receinved', d);
            if (d.context === 'exclude') {
              return `${this.$t('excluding')} <strong>${d.query}</strong>`;
            }
            return `${this.$t('including')} <strong>${d.query}</strong>`;
          });
        return values.join(', ');
      },
    },
  },
};
</script>

<style scoped lang="less">
  @import "./../../assets/less/style.less";

  .results-summary{
    padding: 0px 15px;

    .heading{
      font-size: 1.2em;
    }
    .subheading{
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.8em;
    }

    .hg{
      font-weight: bold;

    }
  }
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
