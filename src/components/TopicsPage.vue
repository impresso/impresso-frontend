<template lang="html">
  <i-layout id="TopicsPage">
    <i-layout-section width="400px" class="border-right ">
      <div slot="header">
        <div class='p-3 border-bottom'>
          <b-input placeholder="filter topics ..." class='my-3'></b-input>
          <label>{{ $t('order_by') }}</label>
          <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </div>
      </div>
      <div class="p-3">
        <div class='topic border-bottom py-2' v-for="topic in topics">
          <div class='badge small-caps'>{{topic.language}}</div>
          <router-link :to="{ name: 'topic', params: { topic_uid: topic.uid }}">{{topic.getHtmlExcerpt()}}</router-link>
          <div class='small-caps'>{{topic.model}}</div>
        </div>
      </div>
    </i-layout-section>
    <router-view></router-view>
  </i-layout>
</template>

<script>
// import Topic from '@/models/Topic';

export default {
  data: () => ({
    submitted: false,
    topics: [],

  }),
  computed: {
    orderByOptions() {
      return [
        {
          value: 'name',
          text: this.$t('sort_name_asc'),
        },
        {
          value: '-name',
          text: this.$t('sort_name_desc'),
        },
        {
          value: 'count',
          text: this.$t('sort_count_asc'),
        },
        {
          value: '-count',
          text: this.$t('sort_count_desc'),
        },
      ];
    },
    topicModel() {
      return this.$route.params;
    },
    orderBy: {
      get() {
        console.log('orderby:', this.$store.state.topics.orderBy);
        return this.$store.state.topics.orderBy;
      },
      set(val) {
        this.$store.commit('topics/UPDATE_ORDER_BY', val);
      },
    },
  },
  watch: {
    '$route.params.topic_uid': {
      immediate: true,
      async handler() {
        // it there is a topic uid, show only topics from this model
        // if model changed.
        this.topics = await this.$store.dispatch('topics/LOAD_TOPICS');
        // this.$store.commit('SET_HEADER_TITLE', {
        //   subtitle: 'topic',
        //   title: 'topics',
        // });
        // console.log('TOPICI', this.topics);
        // load all topic given a
        // console.log('topic changed!', topicUid);
      },
    },
  },
//   methods: {
//     // fetch() {
//     //   // return this.$store.dispatch('topics/LOAD_TOPICS');
//     // },
//   },
  components: {
    // Autocomplete,
  },
};
</script>

<style scoped lang="scss">
.word-probability{
  color: lightgrey;
}
.word:hover{
  .word-probability{
    color: darkgrey;
  }
  box-shadow: 0 1px black;
}
</style>

<i18n>
{
  "en": {
    "order_by": "order by",
    "sort_name_asc": "Main word, A-Z",
    "sort_name_desc": "Main word, Z-A",
    "sort_count_desc": "Number of articles, highest first",
    "sort_count_asc": "Number of articles, lowest first"
  }
}
</i18n>
