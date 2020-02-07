<template lang="html">
  <i-layout-section class="topics-explorer-page" main>
    <!-- slot:header  -->
    <div slot="header">
      <b-navbar>
        <section :class="{'loading': isGraphLoading}">
          <span class="label small-caps">
            {{ $t('summary') }}
          </span><info-button name="why-topic" class="text-muted" />
          <h3 class='mb-1'><span v-if="!isGraphLoading" v-html="$t('topics_cooccurrence_graph', {
            nodes: $n(this.itemsVisualized.length),
            links: $n(this.totalLinks),
          })" /><span v-else v-html="$t('topics_cooccurrence_graph_loading', {
            nodes: $n(this.itemsVisualized.length),
          })"></span></h3>
          <div v-if="countActiveFilters">
            <b-form-checkbox
              v-model="applyCurrentSearchFilters">
            <span v-html="$t('itemStats', {
                count: countActiveFilters
              })"/></b-form-checkbox>
            <search-query-summary class="border-left pl-2 border-tertiary m-0" :search-query='searchQuery'/>
          </div>
        </section>

      </b-navbar>

      <b-navbar class="border-top border-bottom py-0 px-3">

        <b-navbar-nav class="pl-0 pr-2 py-2 border-right">
          <li><label class="pr-2">{{ $t('color by') }}</label>
            <i-dropdown v-model="colorBy" v-bind:options="colorByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="p-2 border-right">
          <li><label class="pr-2">{{ $t('connected') }}</label>
            <i-dropdown v-model="linkBy" v-bind:options="linkByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="p-2 border-right">
          <li><label class="pr-2">{{ $t('size by') }}</label>
            <i-dropdown v-model="sizeBy" v-bind:options="sizeByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="p-2">
          <li><label class="pr-2" v-html="$t('zoom')" />
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
    <b-navbar class="border-top">
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
import SearchQuerySummary from './modules/SearchQuerySummary';

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
    colorBy: 'language',
    sizeBy: 'countItems',
    // legend
    legend: {
      nodeColor: [],
    },
    filteredNodes: [],
    filteredLinks: [],
    zoomLevel: {},
    timers: {},
    //
    isGraphLoading: false,
  }),
  computed: {
    graphNodes() {
      return this.$store.state.topics.graphNodes;
    },
    graphLinks() {
      const mode = this.$store.state.topics.graphLinkMode;
      // console.info('graphLinks changed, mode:', mode);
      return this.$store.state.topics.graphLinks[mode];
    },
    items() {
      return this.$store.state.topics.items;
    },
    itemsIndex() {
      return this.$store.state.topics.visualizedItemsIndex;
    },
    itemsVisualized() {
      return this.$store.state.topics.visualizedItems;
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
      return ['byCommonArticles'].map(value => ({
        value,
        text: this.$t(value),
      }));
    },
    colorByOptions() {
      return [
        // {
        //   value: 'model',
        //   text: this.$t('topicmodel'),
        // },
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
        // {
        //   value: 'hwp',
        //   text: this.$t('highest word probability'),
        // },
      ];
    },

    topicModel() {
      return this.$route.params.topic_model;
    },
    topicUid() {
      return this.$route.params.topic_uid;
    },
    applyCurrentSearchFilters: {
      get() {
        return this.$store.state.topics.applyCurrentSearchFilters;
      },
      set(value) {
        this.$store.dispatch('topics/UPDATE_APPLY_CURRENT_SEARCH_FILTERS', value);
        this.loadGraph();
      },
    },
    searchQuery() {
      return this.$store.getters['search/getSearch'];
    },
    countActiveFilters() {
      return this.$store.getters['search/countActiveFilters'];
    },
  },
  mounted() {
    this.$store.commit('SET_HEADER_TITLE', {
      title: 'topics',
    });

    this.graph = new Graph({
      element: '#d3-graph',
      nodeLabel: d => d.label, // excerpt.map(w => w.w).join('-'),
      showLabel: d => !d.hide,
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
        // console.info(s);
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

    if (this.itemsVisualized.length) {
      this.loadGraph();
    }
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
      // console.info('updateGraph, available nodes:', this.totalNodes, 'available links:', this.totalLinks);

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
        pristine: true,
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
    loadGraph() {
      // console.info('loadGraph() nodes:', this.itemsVisualized.length, 'loading:',this.isGraphLoading);
      // yes, load graph if it is not busy loading
      if (this.timers.debounceLoadGraph) {
        clearTimeout(this.timers.debounceLoadGraph);
      }
      if (this.isGraphLoading || !this.graph) {
        this.timers.debounceLoadGraph = setTimeout(this.loadGraph, 500);
        return;
      }
      this.isGraphLoading = true;
      let filters = [];

      if (this.itemsVisualized.length) {
        filters.push({
          type: 'topic',
          context: 'visualize',
          q: this.itemsVisualized.map(d => d.uid),
        });
      }
      if (this.countActiveFilters && this.applyCurrentSearchFilters) {
        filters = filters.concat(this.$store.getters['search/getSearch'].getFilters());
      }
      return this.$store.dispatch('topics/LOAD_TOPICS_GRAPH', { filters })
        .then(() => {
          // console.info('loadGraph() topics/LOAD_TOPICS_GRAPH resolved:', this.graphNodes):
          this.updateGraph({
            nodes: this.graphNodes,
            links: this.graphLinks,
          });
          this.isGraphLoading = false;
        });
    },
  },
  watch: {
    itemsVisualized() {
      this.loadGraph();
    },
    linkBy: {
      immediate: true,
      handler() {
        this.filteredLinks = this.getFilteredLinks();
        this.updateGraph({
          nodes: this.graphNodes,
          links: this.graphLinks,
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
        // console.info('change colorby', property);
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
        // console.info('change sizeby', property, this.graph.nodes.map(d => d[property]));
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
    SearchQuerySummary,
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

  .nodes > g.fix, .nodes > g.v{
    text {
     display: block;
    }
  }
}

section {
  transition: opacity .4s ease-in-out;
}
section.loading{
  pointer-events: none;
  opacity: .7;
}
</style>
<i18n>
{
  "en": {
    "summary": "Explore the list of topics",
    "topics_cooccurrence_graph": "Visualize <span class='number'>{nodes}</span> topics and their <span class='number'>{links}</span> relationships",
    "topics_cooccurrence_graph_loading": "...Loading visualization of <span class='number'>{nodes}</span> topics ...",
    "color by": "colored by",
    "topic model": "{item.name}",
    "countItems": "number of articles",
    "byCommonWords": "share at least one word",
    "byCommonArticles": "share at least one article",
    "zoom": "zoom &amp; pan",
    "itemStats": "Filter using current search ({count} filters):"
  }
}
</i18n>
