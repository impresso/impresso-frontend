<template>
  <div class="newspaper-item d-flex align-items-center" :class="{ active }">
    <div class="flex-grow-1">
      <router-link v-if="showLink"
        v-bind:class="{ active: active }"
        v-bind:to="itemUrl">
        <strong>{{ item.name}}</strong>
      </router-link>
      <div v-else>
        <h2 v-if="showName" class="sans" :class="{ 'font-weight-bold': item.included }">{{ item.name}} ({{ item.startYear}} - {{ item.endYear}})</h2>
        <div class="small" v-html="stats"></div>
        <div class="small" v-if="showDate" v-html="dates"></div>
      </div>
      <div class="small-caps" v-html="stats"></div>
      <div class="small-caps" v-html="dates"></div>
      <div v-if="item.countIssues < 0">{{$t('unavailable')}}</div>
    </div>
    <div v-if="isObservable" class="px-2" @click="$emit('toggle-observed', item)">
      <div class="item-observed" :class="{ active: observed }"><div class="icon dripicons-preview" /></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    observed: Boolean,
    isObservable: Boolean,
    active: Boolean,
    showLink: Boolean,
    showDate: Boolean,
    showName: {
      type: Boolean,
      default: true,
    },
    item: {
      type: Object,
    },
  },
  computed: {
    itemUrl() {
      return {
        name: 'newspaper_metadata',
        query: this.$route.query,
        params: {
          newspaper_uid: this.item.uid,
        },
      };
    },
    dates() {
      if (this.item.firstIssue) {
        let from;
        let to;

        if (this.item.firstIssue.date instanceof Date) {
          from = this.$d(this.item.firstIssue.date, 'short');
          to = this.$d(this.item.lastIssue.date, 'short');
        } else {
          from = this.$d(new Date(this.item.firstIssue.date), 'short');
          to = this.$d(new Date(this.item.lastIssue.date), 'short');
        }
        return this.$t('availability', { from: asDateTag(from), to: asDateTag(to) });
      } else if(this.item.startYear) {
        return this.$t('availability', {
          from: asDateTag(this.item.startYear),
          to: asDateTag(this.item.endYear)
        })
      }
      return '';
    },
    stats() {
      if (this.item.countIssues > 0) {
        return [
          this.$tc('numbers.articles', this.item.countArticles, {
            n: this.$n(this.item.countArticles),
          }),
          this.$tc('numbers.pages', this.item.countPages, {
            n: this.$n(this.item.countPages),
          }),
          this.$tc('numbers.issues', this.item.countIssues, {
            n: this.$n(this.item.countIssues),
          }),
        ].join(', ');
      }
      return '';
    },
  },
};

const asDateTag = d => `<span class='date'>${d}</span>`
</script>

<style lang="scss">
.newspaper-item {
  h2{
    font-size: inherit;
  }
  .date{
    text-transform: lowercase;
  }
  .number {
  }
}
.newspaper-item.active{
  box-shadow: inset 0.15em 0 #343a40;
  background-color: #f2f2f2;
}
</style>
<i18n lang="json">
  {
    "en": {
      "unavailable": "(coming soon)",
      "availability": "from {from} to {to}"
    }
  }
</i18n>
