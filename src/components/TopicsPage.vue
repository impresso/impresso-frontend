<template lang="html">
  <i-layout id="TopicsPage">
    <i-layout-section width="400px" class="border-right p-2">
      <div slot="header">
        blibl {{topicModel}}
      </div>
      <div class="p-4">
        <div class='topic bb-1' v-for="topic in topics">
          {{topic.model}} {{topic.language}}
          <router-link :to="{ name: 'topic', params: { topic_uid: topic.uid }}">{{topic.getHtmlExcerpt()}}</router-link>

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
    topicModel() {
      return this.$route.params;
    },
  },
  watch: {
    '$route.params.topic_uid': {
      immediate: true,
      async handler(topicUid) {
        // // load single topic data
        this.topics = await this.$store.dispatch('topics/LOAD_TOPICS');

        // this.$store.commit('SET_HEADER_TITLE', {
        //   subtitle: 'topic',
        //   title: 'topics',
        // });
        console.log('TOPICI', this.topics);
        // load all topic given a
        console.log('topic changed!', topicUid);
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
