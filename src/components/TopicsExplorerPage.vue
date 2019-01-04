<template lang="html">
  <i-layout-section>

    <b-navbar type="light" variant="light" class="border-bottom">
      <section>
        <span class="label">{{$t("topic")}} {{ topic.model }} - {{ topic.language }}</span>
        <h3>"{{ topic.getHtmlExcerpt() }} ..."</h3>
      </section>
    </b-navbar>


    <!--  -->
    <div class="p-3 pt-2">
      <div style="height: 7.5rem; overflow: hidden">
      <div class="d-inline-block word" v-for="(word, idx) in topic.words">
        <span :style='{opacity: word.l}'>{{ word.w }}</span>
        <span class="word-probability">{{word.p}}</span>
        <span v-if="idx < topic.words.length - 1">&middot;&nbsp;</span>
      </div>
    </div>
    </div>
  </i-layout-section>
</template>

<script>
import Topic from '@/models/Topic';

export default {
  data: () => ({
    submitted: false,
    topic: new Topic(),
  }),
  computed: {
    topicModel() {
      return this.$route.params.topic_model;
    },
    topicUid() {
      return this.$route.params.topic_uid;
    },
  },
  watch: {
    '$route.params.topic_uid': {
      immediate: true,
      async handler(topicUid) {
        // load single topic data
        this.topic = await this.$store.dispatch('topics/LOAD_TOPIC', topicUid);

        this.$store.commit('SET_HEADER_TITLE', {
          subtitle: 'topic',
          title: 'topics',
        });

        // load all topic given a
      },
    },
  },
  methods: {
    // fetch() {
    //   // return this.$store.dispatch('topics/LOAD_TOPICS');
    // },
  },
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
