<template lang="html">
  <i-layout-section>

    <b-navbar type="light" variant="light" class="border-bottom">
      <section class='pt-2 pb-1'>
        <span class="label small-caps">{{$t('summary')}}</span>
        <h3 class='mb-1'>{{ $t('topics_cooccurrence_graph') }}</h3>
      </section>
    </b-navbar>
    <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
      <b-navbar-nav class="px-1">
        <li class='p-2 border-right'>
          <b>{{$n(this.totalNodes)}}</b>
          <label>{{$t('topics')}}</label>
        </li>
      </b-navbar-nav>
      <b-navbar-nav class="px-1 ">
        <li class="p-2 border-right"><label >{{ $t('color by') }}</label>
          <i-dropdown v-model="colorBy" v-bind:options="colorByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </li>
      </b-navbar-nav>
      <b-navbar-nav class="pl-3 pr-2 py-2 pr-auto border-right">
        <li><label >{{ $t('size by') }}</label>
          <i-dropdown v-model="sizeBy" v-bind:options="sizeByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </li>
      </b-navbar-nav>
    </b-navbar>

    <div class="d3-graph-wrapper small-caps">
      <div id="d3-graph" class="border-bottom" ></div>
      <tooltip v-model="tooltip" />
    </div>

    <b-navbar>
      <b-navbar-nav>
      <li>
        <label>{{$t('legend')}}</label>
        <div class="d-inline-block pl-2" v-for="item in legend.nodeColor">
          <div class='legend-node' v-bind:style="{backgroundColor: item.color}"></div>
          <span>{{item.name}} ({{$n(item.count)}})</span>
        </div>
      </li>
      </b-navbar-nav>
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
    // count
    totalNodes: 0,
    totalLinks: 0,
    // visual dimensions
    colorBy: 'model',
    sizeBy: 'degree',
    // legend
    legend: {
      nodeColor: [],
    },
  }),
  computed: {
    colorByOptions() {
      return [
        {
          value: 'model',
          text: this.$t('topicmodel'),
        },
        {
          value: 'language',
          text: this.$t('language'),
        },
      ];
    },
    sizeByOptions() {
      return [
        {
          value: 'degree',
          text: this.$t('degree'),
        },
        {
          value: 'hwp',
          text: this.$t('highest word probability'),
        },
      ];
    },

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

    this.totalNodes = topicsGraph.nodes.length;
    this.totalLinks = topicsGraph.links.length;

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
      })
      .on('dimension.updated', (dimension) => {
        console.log('@dimension.updated', dimension);
        if (this.legend[dimension.name]) {
          this.legend[dimension.name] = dimension.legend;
        }
      });

    this.graph.updateDimension({
      name: 'nodeColor',
      property: this.colorBy,
      values: topicsGraph.nodes,
    });

    this.graph.updateDimension({
      name: 'nodeSize',
      property: this.sizeBy,
      values: topicsGraph.nodes,
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
    colorBy: {
      handler(property) {
        console.log('change colorby', property);
        this.graph.updateDimension({
          name: 'nodeColor',
          property,
          values: this.graph.nodes,
        });
        this.graph.applyDimensions();
      },
    },
    sizeBy: {
      handler(property) {
        console.log('change sizeby', property);
        this.graph.updateDimension({
          name: 'nodeSize',
          property,
          values: this.graph.nodes,
        });
        this.graph.applyDimensions();
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
  height: 80%;
  position: relative;
}
.legend-item{

}
.legend-node{
  width: 1rem;
  height: 1rem;
  display: inline-block;
  border-radius: 1rem;
  border: 1px solid black;
}

#d3-graph{
  height: 100%;

  line {
    stroke: #f0f0f0;
  }
  text{
    pointer-events: none;
    display: none;
  }
}

</style>
<i18n>
{
  "en": {
    "summary": "Explore the list of topics",
    "topics_cooccurrence_graph": "Visualise the topics and how they co-occur",
    "color by": "colored by",
    "topic model": "{item.name}"
  }
}
</i18n>
