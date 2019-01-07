<template lang="html">
  <i-layout-section>

    <b-navbar type="light" variant="light" class="border-bottom">
      <section>
        <span class="label small-caps">{{$t('summary')}}</span>
        <h3>{{ $t('topics_cooccurrence_graph') }}</h3>
      </section>
    </b-navbar>

    <div class="d3-graph-wrapper small-caps">
      <div id="d3-graph" class="border-bottom" ></div>
    </div>
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
import Graph from '@/d3-modules/Graph';

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
  mounted() {
    this.$store.commit('SET_HEADER_TITLE', {
      title: 'topics',
    });

    this.graph = new Graph({
      element: '#d3-graph',
    });

    this.graph
      .on('node.mouseleave', (d) => {
        console.log('node.mouseleave', d);
      })
      .on('node.mouseenter', (d) => {
        console.log('node.mouseenter', d);
      });

    this.graph.update({
      nodes: [
        {
          id: 'Agricultural \'waste\'',
          w: 10,
        },
        {
          id: 'Bio-conversion',
          w: 9,
        },
        {
          id: 'Liquid',
          w: 7,
        },
        {
          id: 'Biofuel imports',
          w: 1,
        },
      ],
      links: [
        {
          source: 0,
          target: 1,
          w: 2,
        },
        {
          source: 1,
          target: 2,
          w: 1,
        },
        {
          source: 1,
          target: 3,
          w: 3,
        },
        {
          source: 0,
          target: 3,
          w: 2,
        },
      ],
    });
  },
  watch: {
    '$route.params.topic_uid': {
      immediate: true,
      async handler(topicUid) {
        // load single topic data
        if (topicUid) {
          this.topic = await this.$store.dispatch('topics/LOAD_TOPIC', topicUid);
        }
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

<style  lang="scss">
.d3-graph-wrapper{
  height: 60%;
}

#d3-graph{
  height: 100%;

  line {
    stroke: darkgrey;
  }
}
</style>
<i18n>
{
  "en": {
    "summary": "Explore the list of topics",
    "topics_cooccurrence_graph": "Visualise the topics and how they co-occur"
  }
}
</i18n>
