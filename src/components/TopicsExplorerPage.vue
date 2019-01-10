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
      <tooltip v-model="tooltip" />
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
import Tooltip from './modules/tooltips/TopicsExplorerTooltip';

export default {
  data: () => ({
    submitted: false,
    topic: new Topic(),
    tooltip: {
      x: 0,
      y: 0,
      count: 0,
      isActive: false,
    },
  }),
  computed: {
    topicModel() {
      return this.$route.params.topic_model;
    },
    topicUid() {
      return this.$route.params.topic_uid;
    },
  },
  async mounted() {
    this.$store.commit('SET_HEADER_TITLE', {
      title: 'topics',
    });

    const topicsGraph = await this.$store.dispatch('topics/LOAD_TOPICS_GRAPH');

    this.graph = new Graph({
      element: '#d3-graph',
    });

    this.graph

      .on('node.mouseleave', (d) => {
        console.log('node.mouseleave', d);
        this.tooltip = {
          ...d,
          isActive: false,
        };
      })
      .on('node.mouseenter', (d) => {
        console.log('node.mouseenter', d);
        this.tooltip = {
          x: d.x,
          y: d.y,
          item: d,
          isActive: true,
        };
      });

    this.graph.update({
      nodes: topicsGraph.nodes,
      links: topicsGraph.links,
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
    Tooltip,
  },
};
</script>

<style  lang="scss">
.d3-graph-wrapper{
  height: 90%;
  position: relative;
}

#d3-graph{
  height: 100%;

  line {
    stroke: darkgrey;
  }
  text{
    pointer-events: none;
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
