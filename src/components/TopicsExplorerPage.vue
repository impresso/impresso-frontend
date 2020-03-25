<template lang="html">
  <i-layout-section class="topics-explorer-page" main>
    <!-- slot:header  -->
    <div slot="header">
      <b-navbar>
        <section>
          <span class="label small-caps">
            {{ $t('summary') }}
          </span><info-button name="why-topic" class="text-muted" />
          <h3>
            <span v-html="$t('topics_cooccurrence_graph', {
              nodes: $n(this.nodes.length),
            })"></span>
          </h3>
          <div v-if="countActiveFilters">
            <b-form-checkbox
              v-model="applyCurrentSearchFilters">
            <span v-html="$t('itemStats', {
                count: countActiveFilters
              })"/></b-form-checkbox>
            <!-- <search-query-summary class="border-left pl-2 border-tertiary m-0" :search-query='searchQuery'/> -->
          </div>
        </section>
      </b-navbar>
      <b-navbar class="border-top border-bottom py-0 px-3">
        <b-navbar-nav class="pl-0 pr-2 py-2 border-right">
          <label class="pr-2">{{ $t('color by') }}</label>
          <i-dropdown v-model="colorBy" v-bind:options="colorByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </b-navbar-nav>
        <b-navbar-nav class="p-2 border-right">
          <label class="pr-2">{{ $t('size by') }}</label>
          <i-dropdown v-model="sizeBy" v-bind:options="sizeByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </b-navbar-nav>
        <b-navbar-nav class="p-2" v-if="isZoomed">
          <label class="pr-2" v-html="$t('zoom', {
            k: parseInt(zoomTransform.k * 100, 10),
          })" />
          <b-button v-on:click="zoomReset()" variant="secondary" size="sm">{{ $t('actions.reset') }}</b-button>
        </b-navbar-nav>
      </b-navbar>
    </div><!-- slot:header -->
    <!-- slot:body or default  -->
    <div class="d3-graph-wrapper position-relative h-100 small-caps bg-light">
      <div id="d3-graph" class="h-100"></div>
      <tooltip v-model="tooltip" />
    </div>
    <!-- slot:footer  -->
    <div slot="footer">
      <b-navbar class="border-top">
        <legend>legend {{itemsVisualized.length}} {{ isGraphLoading }}</legend>
        <!-- /{{ zoomTransform }}/ -->
      </b-navbar>
    </div>
  </i-layout-section>
</template>

<script>
import Graph from '@/d3-modules/Graph';
import InfoButton from '@/components/base/InfoButton';
import Tooltip from '@/components/modules/tooltips/TopicsExplorerTooltip';
import {topicsGraph} from '@/services';

export default {
  props: {
    filters: {
      /** @type {import('vue').PropType<Filter[]>} */
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    tooltip: {
      x: 0,
      y: 0,
      count: 0,
      isActive: false,
    },
    nodes: [],
    links: [],
    // visual dimensions
    colorBy: 'language',
    sizeBy: 'degree', // 'countItems',
    //
    isGraphLoading: false,
    zoomTransform: {
      k: 1,
      x: 0,
      y: 0,
    },
  }),
  computed: {
    applyCurrentSearchFilters: {
      get() {
        return this.$store.state.topics.applyCurrentSearchFilters;
      },
      set(value) {
        this.$store.dispatch('topics/UPDATE_APPLY_CURRENT_SEARCH_FILTERS', value);
        // this.loadGraph();
      },
    },
    countActiveFilters() {
      return this.filters
        .filter(d => !['hasTextContents'].includes(d.type)).length;
    },
    colorByOptions() {
      return [
        {
          value: 'language',
          text: this.$t('language'),
        },
      ];
    },
    itemsVisualized() {
      return this.$store.state.topics.visualizedItems;
    },
    isZoomed() {
      const { k, x, y} = this.zoomTransform;
      return k !== 1 && x !== 0 && y !== 0;
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
      ];
    },
  },
  async mounted() {
    // load base graph
    this.isGraphLoading = true;
    await topicsGraph.find({}).then(({ nodes, links, info}) => {
      this.nodes = nodes.map(d => ({
        ...d,
        x: d.pos.x * 1.5,
        y: d.pos.y * 1.5,
      }));
      this.links = links;
      console.info('@mounted, topicsGraph loaded.', info, nodes);
    });
    this.isGraphLoading = false;

    if (this.countActiveFilters) {
      console.info('@mounted, filters active in search.');
    }

    this.graph = new Graph({
      element: '#d3-graph',
      nodeLabel: d => d.label, // excerpt.map(w => w.w).join('-'),
      showLabel: d => !d.hide,
      identity: d => d.uid,
    });

    this.graph
      .on('svg.click', () => {
        this.tooltip.isActive = false;
        this.graph.unSelectNode();
      })
      .on('svg.zoom', (zoomTransform) => {
        this.zoomTransform = zoomTransform;
        // if (this.tooltip.isActive) {
        //   const {x, y} = this.tooltip.item;
        //   this.tooltip.x = x;
        //   this.tooltip.y = y;
        // }
      })
      // .on('node.tick', (d) => {
      //   this.tooltip.x = d.x;
      //   this.tooltip.y = d.y;
      // })
      .on('node.click', (item) => {
        // const { x, y } = item;
        this.tooltip = {
          x: this.graph.width/2 - 100,
          y: this.graph.height - 200,
          item,
          isActive: true,
        };
        this.$store.dispatch('topics/ADD_VISUALIZED_ITEM', item);
        this.graph.zoomTo(item);
        this.graph.selectNode(item);
        this.graph.selectNeighbors(item);
      })
      // .on('dimension.updated', (dimension) => {
      //   if (this.legend[dimension.name]) {
      //     this.legend[dimension.name] = dimension.legend;
      //   }
      // });
    window.addEventListener('resize', this.onResize);

    this.updateGraph();
    console.info('highlightNodes this.itemsVisualized. ', this.itemsVisualized);
    if (this.itemsVisualized.length) {
      this.graph.highlightNodes(this.itemsVisualized);
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {
      console.info('TopicExplorer@resize');
      if (this.graph) {
        this.graph.resize();
      }
    },
    updateGraph() {
      this.graph.updateDimension({
        name: 'nodeColor',
        property: this.colorBy,
        values: this.nodes,
      });
      this.graph.updateDimension({
        name: 'nodeSize',
        property: this.sizeBy,
        values: this.nodes,
      });
      this.graph.update({
        nodes: this.nodes,
        links: this.links,
      });
    },
    zoomReset() {
      this.graph.zoom();
    },
    async loadGraph() {
      if (this.isGraphLoading) {
        console.warn('loadGraph busy...');
        return;
      }
      this.isGraphLoading = true;
      this.nodes = await topicsGraph.find({}).finally(() => {
        this.isGraphLoading = true;
      });
      console.info(this.nodes);
      this.updateGraph();
    },
  },
  watch: {
    colorBy(property) {
      // console.info('change colorby', property);
      this.graph.updateDimension({
        name: 'nodeColor',
        property,
        values: this.graph.nodes,
      });
      this.graph.applyDimensions();
    },
    sizeBy(property) {
      this.graph.updateDimension({
        name: 'nodeSize',
        property,
        values: this.nodes,
      });
      this.graph.applyDimensions();
    },
    itemsVisualized(items) {
      console.info('@itemsVisualized', items);
      this.graph.highlightNodes(items);
    },
  },
  components: {
    InfoButton,
    Tooltip,
  }
}
</script>

<style lang="scss">
#d3-graph{
  svg.with-highlights{
    .nodes .n .c{
      opacity: .1;
    }
    .nodes .n.highlight{
      outline: 0;
    }
    .nodes .n.highlight .c{
      opacity: 1;
    }
    .nodes .n.highlight text{
      display: block;
      fill: rgba(0,0,0, .7);
    }
  }
  svg.with-selected{
    .nodes .n.selected .c{
      stroke-width: 2px;
      stroke: black;
    }
    .nodes .n.highlight text{
      display: block;
      fill: rgba(0,0,0, .2);
    }
    .nodes .n.selected text {
      fill: black;
      display: block;
    }
  }
  line.selected{
    display: block;
  }
  line {
    stroke: #e0e0e0;
    display: none;
  }
  text{
    pointer-events: none;
    display: none;
  }

  .nodes > g:hover {
    .whoosh{
      transform: scale(6);
      transition: transform .6s cubic-bezier(.8,-.5,.2,1.4);
    }

    text{
      display: block;
    }
  }

  /* .nodes > g.fix, .nodes > g.v{
    text {
     display: block;
    }
  } */
}
</style>
<i18n>
{
  "en": {
    "summary": "Explore the list of topics",
    "topics_cooccurrence_graph": "Graph of <span class='number'>{nodes}</span> topics",
    "zoom": "zoom: {k}%",
    "itemStats": "Highlight topics in current search ({count} filters)"
  }
}
</i18n>
