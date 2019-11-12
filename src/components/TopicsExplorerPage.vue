<template lang="html">
  <i-layout-section>
    <div slot="header">
      <b-navbar  type="light" variant="light" class="border-bottom">
        <section class='pt-2 pb-1'>
          <span class="label small-caps">{{$t('summary')}}</span>
          <h3 class='mb-1' v-html="$t('topics_cooccurrence_graph', {
            nodes: $n(this.totalNodes),
            links: $n(this.totalLinks),
          })" />
        </section>
      </b-navbar>
      <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">

        <b-navbar-nav class="px-1 ">
          <li class="p-2 border-right"><label >{{ $t('color by') }}</label>
            <i-dropdown v-model="colorBy" v-bind:options="colorByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="px-1 ">
          <li class="p-2 border-right"><label >{{ $t('connected if') }}</label>
            <i-dropdown v-model="linkBy" v-bind:options="linkByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="pl-3 pr-2 py-2 pr-auto border-right">
          <li><label >{{ $t('size by') }}</label>
            <i-dropdown v-model="sizeBy" v-bind:options="sizeByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </div>
    <div class="d3-graph-wrapper small-caps bg-light">
      <div id="d3-graph"></div>
      <tooltip v-model="tooltip" />
    </div>

<div slot="footer">
    <b-navbar class="bg-light">
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
    linkBy: 'wordInCommon',
    colorBy: 'model',
    sizeBy: 'degree',
    // legend
    legend: {
      nodeColor: [],
    },
  }),
  computed: {
    itemsIndex() {
      return this.$store.state.topics.itemsIndex;
    },
    linkByOptions() {
      return [
        {
          value: 'wordInCommon',
          text: this.$t('wordInCommon'),
        },
      ];
    },
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
  mounted() {
    this.$store.commit('SET_HEADER_TITLE', {
      title: 'topics',
    });

    this.graph = new Graph({
      element: '#d3-graph',
      nodeLabel: d => d.excerpt.map(w => w.w).join('-'),
    });

    this.graph
      .on('svg.click', (d) => {
        // console.info('svg.click', d);
        this.tooltip = {
          ...d,
          isActive: false,
        };
      })
      .on('node.tick', (d) => {
        this.tooltip.x = d.x;
        this.tooltip.y = d.y;
      })
      .on('node.click', (d) => {
        // console.info('node.click', d);
        this.tooltip = {
          x: d.x,
          y: d.y,
          item: d,
          isActive: true,
        };
      })
      .on('node.click', (d) => {
        // console.info('node.click', d);
        this.tooltip = {
          x: d.x,
          y: d.y,
          item: d,
          isActive: true,
        };
      })
      .on('dimension.updated', (dimension) => {
        if (this.legend[dimension.name]) {
          this.legend[dimension.name] = dimension.legend;
        }
      });

    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {
      console.info('TopicExplorer@resize');
      this.graph.resize();
    },
  },
  watch: {
    itemsIndex: {
      immediate: true,
      deep: true,
      async handler(itemsIndex) {
        // if there is no graph, load the graph first.
        if (!this.totalNodes) {
          console.info('@itemsIndex updated, loading graph...');
          await this.$store.dispatch('topics/LOAD_TOPICS_GRAPH').then((topicsGraph) => {
            this.totalNodes = topicsGraph.nodes.length;
            this.totalLinks = topicsGraph.links.length;

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
          });
          console.info('@itemsIndex updated, graph loaded.');
        }
        // re evaluate graph
        console.info('@itemsIndex updated, highlight search results in graph.', itemsIndex);
      },
    },
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
        console.info('change colorby', property);
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
        console.info('change sizeby', property);
        this.graph.updateDimension({
          name: 'nodeSize',
          property,
          values: this.graph.nodes,
        });
        this.graph.applyDimensions();
      },
    },
  },
  components: {
    Tooltip,
  },
};
</script>

<style  lang="scss">
.d3-graph-wrapper{
  height: 100%;
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
    stroke: #e0e0e0;
  }
  text{
    pointer-events: none;
    display: none;
  }

  .nodes > g:hover {
    .whoosh{
      transform: scale(5);
    }

    text{
      display: block;
    }
  }

  .nodes > g.fix text{
    display: block;
  }
}

</style>
<i18n>
{
  "en": {
    "summary": "Explore the list of topics",
    "topics_cooccurrence_graph": "Visualise <span class=\"number\">{nodes}</span> topics and their <span class=\"number\">{links}</span> co-occurrences",
    "color by": "colored by",
    "topic model": "{item.name}"
  }
}
</i18n>
