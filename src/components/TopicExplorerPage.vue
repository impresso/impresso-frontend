<template lang="html">
  <i-layout id="TopicPage">
    <i-layout-section width="400px" class="border-right p-2">
      <div slot="header">
        blibl
      </div>
      <div class="p-4">
      </div>
    </i-layout-section>
    <i-layout-section>

      <b-navbar type="light" variant="light" class="border-bottom">
        <section>
          <span class="label">{{$t("topic")}} {{ topic.model }} - {{ topic.language }}</span>
          <h3>"{{ topic.getHtmlExcerpt() }} ..."</h3>
        </section>
      </b-navbar>


      <!--  -->
      <div class="p-3 pt-2">
        <div class="d-inline-block" v-for="(word, idx) in topic.words">
          <span class="word">{{ word.w }}</span>
          <span class="word-probability">{{word.p}}</span>
          <span v-if="idx < topic.words.length - 1">&middot;&nbsp;</span>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
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
      handler(topicUid) {
        // load single topic data
        this.$store.dispatch('topics/LOAD_TOPIC', topicUid).then((topic) => {
          this.topic = topic;
        });
        this.$store.commit('SET_HEADER_TITLE', {
          subtitle: 'topic',
          title: 'topics',
        });
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
