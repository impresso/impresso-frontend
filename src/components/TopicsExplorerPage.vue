<template lang="html">
  <i-layout-section class="topics-explorer-page" main>
    <div slot="header">
      <b-navbar  type="light" variant="light" class="border-bottom">
        <section class='pt-2 pb-1'>
          <span class="label small-caps">{{$t('summary')}}</span>
          <small><info-button name="why-topic" class="text-muted" /></small>
          <h3 class='mb-1' v-html="$t('topics_cooccurrence_graph', {
            items: $n(this.filteredNodes.length),
            rels: $n(this.filteredLinks.length),
            nodes: $n(this.totalNodes),
            links: $n(this.totalLinks),
          })" />
        </section>
      </b-navbar>
      <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">

        <b-navbar-nav class="px-2 pt-2 pb-1 border-right">
          <li ><label >{{ $t('color by') }}</label>
            <i-dropdown v-model="colorBy" v-bind:options="colorByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="px-2 pt-2 pb-1  border-right">
          <li ><label >{{ $t('connected') }}</label>
            <i-dropdown v-model="linkBy" v-bind:options="linkByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="px-2 pt-2 pb-1 border-right">
          <li><label >{{ $t('size by') }}</label>
            <i-dropdown v-model="sizeBy" v-bind:options="sizeByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="px-2 pt-2 pb-1">
          <li><label v-html="$t('zoom')" />
            <b-button v-on:click="zoomReset()" variant="secondary" size="sm">{{ $t('actions.reset') }}</b-button>
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
        <div class="d-inline-block pl-2" v-for="(item,i) in legend.nodeColor" :key="i">
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
import InfoButton from './base/InfoButton';


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
    sizeBy: 'countItems',
    // legend
    legend: {
      nodeColor: [],
    },
    filteredNodes: [],
    filteredLinks: [],
    zoomLevel: {},
  }),
  computed: {
    graphNodes() {
      return this.$store.state.topics.graphNodes;
    },
    graphLinks() {
      const mode = this.$store.state.topics.graphLinkMode;
      console.info('graphLinks changed, mode:', mode);
      return this.$store.state.topics.graphLinks[mode];
    },
    items() {
      return this.$store.state.topics.items;
    },
    itemsIndex() {
      return this.$store.state.topics.visualizedItemsIndex;
    },
    linkBy: {
      get() {
        return this.$store.state.topics.graphLinkMode;
      },
      set(v) {
        this.$store.dispatch('topics/CHANGE_GRAPH_LINK_MODE', v);
      },
    },
    linkByOptions() {
      return ['byCommonWords', 'byCommonArticles'].map(value => ({
        value,
        text: this.$t(value),
      }));
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
          value: 'countItems',
          text: this.$t('countItems'),
        },
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
      .on('svg.zoom', (s) => {
        console.info(s);
        this.zoomLevel = {
          ...s,
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
    updateGraph({ nodes, links }) {
      if (!this.graph) {
        console.warn('updateGraph() called when graph is not ready');
        return;
      }

      this.totalNodes = this.graphNodes.length;
      this.totalLinks = this.graphLinks.length;
      console.info('updateGraph, available nodes:', this.totalNodes, 'available links:', this.totalLinks);

      this.graph.updateDimension({
        name: 'nodeColor',
        property: this.colorBy,
        values: nodes,
      });

      this.graph.updateDimension({
        name: 'nodeSize',
        property: this.sizeBy,
        values: nodes,
      });

      this.graph.update({
        nodes,
        links,
      });
    },
    zoomReset() {
      this.graph.zoom();
    },
    onResize() {
      console.info('TopicExplorer@resize');
      this.graph.resize();
    },
    getFilteredNodes() {
      return this.graphNodes.filter(d => typeof this.itemsIndex[d.uid] !== 'undefined');
    },
    getFilteredLinks() {
      // get map of uids
      const filteredNodesUids = this.filteredNodes.map(d => d.uid);
      // loop through our graphLinks
      return this.graphLinks.map((d) => {
        const s = this.graphNodes[d.source].uid;
        const t = this.graphNodes[d.target].uid;

        if (this.itemsIndex[t] === undefined || this.itemsIndex[s] === undefined) {
          return null;
        }
        // change source and target id
        return {
          ...d,
          source: filteredNodesUids.indexOf(s),
          target: filteredNodesUids.indexOf(t),
        };
      }).filter(d => d);
    },
  },
  watch: {
    itemsIndex: {
      async handler(itemsIndex) {
        // console.log('ohlalal', itemsIndex);
        if (this.graph) {
          console.info('sosiodisodiosd', this.graph, itemsIndex);

          this.updateGraph({
            nodes: this.graphNodes,
            links: [],
          });
        }
        // if there is no graph, load the graph first.
        // if (itemsIndex && !this.totalNodes) {
        //   console.info('@itemsIndex updated, loading graph...');
        //   // await this.$store.dispatch('topics/LOAD_TOPICS_GRAPH');
        //   // console.info('@itemsIndex updated, graph loaded.');
        // }
        // // re evaluate graph
        // if (this.graph) {
        //   if (this.timerDelayGraphUpdate) {
        //     clearTimeout(this.timerDelayGraphUpdate);
        //   }
        //
        //   console.info('@itemsIndex updated, update graph in 2s...');
        //
        //   this.timerDelayGraphUpdate = setTimeout(() => {
        //     this.filteredNodes = this.getFilteredNodes();
        //     this.filteredLinks = this.getFilteredLinks();
        //
        //     console.info('@itemsIndex n. filtered nodes:', this.filteredNodes.length);
        //     console.info('@itemsIndex n. filtered links:', this.filteredLinks.length);
        //
        //     this.updateGraph({
        //       nodes: this.filteredNodes,
        //       links: this.filteredLinks,
        //     });
        //   }, 500);
        // }
      },
    },
    linkBy: {
      immediate: true,
      handler() {
        this.filteredLinks = this.getFilteredLinks();
        this.updateGraph({
          nodes: this.filteredNodes,
          links: this.filteredLinks,
        });
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
    InfoButton,
  },
};
</script>

<style  lang="scss">
.d3-graph-wrapper{
  height: 100%;
  position: relative;
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

  .nodes > g.fix{
    text {
     display: block;
    }
  }
}

</style>
<i18n>
{
  "en": {
    "summary": "Explore the list of topics",
    "topics_cooccurrence_graph": "Visualise <span class='number'>{items}</span> / <span class='number'>{nodes}</span> topics and their <span class='number'>{rels}</span> / <span class='number'>{links}</span> relationships",
    "color by": "colored by",
    "topic model": "{item.name}",
    "countItems": "number of articles",
    "byCommonWords": "share at least one word",
    "byCommonArticles": "share at least one article",
    "zoom": "zoom &amp; pan"
  }
}
</i18n>
