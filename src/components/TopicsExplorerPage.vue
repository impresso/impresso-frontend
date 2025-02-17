<template lang="html">
  <i-layout-section ref="explorerPage" class="topics-explorer-page" main>
    <!-- slot:header  -->
    <template v-slot:header>
      <b-navbar>
        <section>
          <span class="label small-caps"> {{ $t('summary') }} </span
          ><info-button name="topic-graph" class="text-muted" />
          <h3>
            <span
              v-html="
                $t('topics_cooccurrence_graph', {
                  nodes: $n(this?.nodes?.length ?? 0)
                })
              "
            ></span>
          </h3>
          <div v-if="countActiveFilters">
            <b-form-checkbox v-model="applyCurrentSearchFilters">
              <span
                v-html="
                  $t('itemStats', {
                    count: countActiveFilters
                  })
                "
            /></b-form-checkbox>
            <!-- <search-query-summary class="border-left pl-2 border-tertiary m-0" :search-query='searchQuery'/> -->
          </div>
        </section>
      </b-navbar>
      <b-navbar class="border-top border-bottom py-0 px-3">
        <b-navbar-nav class="pl-0 pr-2 py-2 border-right">
          <label class="pr-2">{{ $t('color by') }}</label>
          <i-dropdown
            v-model="colorBy"
            v-bind:options="colorByOptions"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
        </b-navbar-nav>
        <b-navbar-nav class="p-2 border-right">
          <label class="pr-2">{{ $t('size by') }}</label>
          <i-dropdown
            v-model="sizeBy"
            v-bind:options="sizeByOptions"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
        </b-navbar-nav>
        <b-navbar-nav class="p-2" v-if="isZoomed">
          <label
            class="pr-2"
            v-html="
              $t('zoom', {
                k: parseInt(zoomTransform.k * 100, 10)
              })
            "
          />
          <b-button v-on:click="zoomReset()" variant="secondary" size="sm">{{
            $t('actions.reset')
          }}</b-button>
        </b-navbar-nav>
      </b-navbar> </template
    ><!-- slot:header -->
    <!-- slot:body or default  -->
    <div
      class="d3-graph-wrapper position-relative h-100 small-caps bg-light"
      v-on:mousemove="onMousemove"
    >
      <div id="d3-graph" ref="graph" class="h-100"></div>
      <tooltip :tooltip="edgeTooltip" :class="{ fadeOut: edgeTooltip.fadeOut }">
        <div v-if="selectedLink">
          <div
            v-html="
              $tc('numbers.articlesInCommon', selectedLink?.w ?? 0, {
                n: $n(selectedLink?.w ?? 0)
              })
            "
          />
          <em>click to open in search page ...</em>
          <div>
            <span class="badge">{{ selectedLink.source.language }}</span>
            <b>{{ selectedLink.source.label }}</b>
          </div>
          <div><div class="dripicons-arrow-thin-down" /></div>
          <div>
            <span class="badge">{{ selectedLink.target.language }}</span>
            <b>{{ selectedLink.target.label }}</b>
          </div>
        </div>
      </tooltip>
      <topics-explorer-tooltip v-model="tooltip" @toggle-highlighted="handleToggleHighlighted" />
    </div>
    <!-- slot:footer  -->
    <template v-slot:footer>
      <b-navbar class="border-top">
        <legend>
          <div class="border bg-white p-1" style="height: 40px; overflow: scroll">
            <div
              class="d-inline-flex mx-1 align-items-center"
              v-for="(item, i) in legend.nodeColor"
              :key="i"
            >
              <div class="legend-node mr-1" v-bind:style="{ backgroundColor: item.color }"></div>
              <div>{{ item.name }} ({{ $n(item.count) }})</div>
            </div>
          </div>
        </legend>
        <!-- /{{ zoomTransform }}/ -->
      </b-navbar>
    </template>
  </i-layout-section>
</template>

<script>
import Graph from '@/d3-modules/Graph'
import InfoButton from '@/components/base/InfoButton.vue'
import Tooltip from '@/components/modules/tooltips/Tooltip.vue'
import TopicsExplorerTooltip from '@/components/modules/tooltips/TopicsExplorerTooltip.vue'
import { topicsGraph } from '@/services'
import { serializeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import { mapStores } from 'pinia'
import { useTopicsStore } from '@/stores/topics'

export default {
  props: {
    filters: {
      /** @type {import('vue').PropType<Filter[]>} */
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    edgeTooltip: {
      x: 0,
      y: 0,
      isActive: false,
      fadeOut: false
    },
    tooltip: {
      x: 0,
      y: 0,
      count: 0,
      isActive: false
    },
    nodes: [],
    links: [],
    // visual dimensions
    colorBy: 'community',
    sizeBy: 'pagerank', // 'countItems',
    //
    legend: {
      nodeColor: []
    },
    //
    isGraphLoading: false,
    zoomTransform: {
      k: 1,
      x: 0,
      y: 0
    },
    selectedNode: null,
    selectedLink: null,
    applyCurrentSearchFilters: false,
    //
    timerUnselectLink: 0
  }),
  computed: {
    ...mapStores(useTopicsStore),
    countActiveFilters() {
      return this.filters.filter(d => !['hasTextContents'].includes(d.type)).length
    },
    colorByOptions() {
      return [
        {
          value: 'language',
          text: this.$t('language')
        },
        {
          value: 'community',
          text: this.$t('community')
        }
      ]
    },
    itemsFiltered() {
      return this.topicsStore.items
    },
    itemsVisualized() {
      return this.topicsStore.visualizedItems
    },
    visualizedItemsIndex() {
      return this.topicsStore.visualizedItemsIndex
    },
    isZoomed() {
      const { k, x, y } = this.zoomTransform
      return k !== 1 && x !== 0 && y !== 0
    },
    sizeByOptions() {
      return [
        {
          value: 'countItems',
          text: this.$t('countItems')
        },
        {
          value: 'degree',
          text: this.$t('degree')
        },
        {
          value: 'pagerank',
          text: this.$t('pagerank')
        }
      ]
    }
  },
  async mounted() {
    // load base graph
    this.isGraphLoading = true
    await topicsGraph.find({}).then(({ nodes, links }) => {
      this.nodes = nodes
        .filter(d => d.pos.x && d.pos.y)
        .map(d => ({
          ...d,
          x: d.pos.x * 2, // 1.414,
          y: d.pos.y * 2
        }))
      this.links = links
    })
    this.isGraphLoading = false

    this.graph = new Graph({
      element: this.$refs.graph,
      nodeLabel: d => d.label, // excerpt.map(w => w.w).join('-'),
      showLabel: d => d.community === d.uid,
      identity: d => d.uid
    })

    this.graph
      .on('svg.click', () => {
        this.unselectNode()
      })
      .on('svg.zoom', zoomTransform => {
        this.zoomTransform = zoomTransform
      })
      .on('node.click', item => {
        if (this.selectedNode && item.uid === this.selectedNode) {
          this.unselectNode()
        } else {
          this.selectNode(item)
        }
      })
      .on('link.mouseenter', this.selectLink)
      .on('link.click', link => {
        if (this.selectedLink && link.id === this.selectedLink.id) {
          this.$router.push({
            name: 'search',
            query: {
              [CommonQueryParameters.SearchFilters]: serializeFilters([
                {
                  type: 'topic',
                  q: [link.target.uid, link.source.uid],
                  op: 'AND'
                }
              ])
            }
          })
        } else {
          this.selectLink(link)
        }
      })
      .on('link.mouseleave', this.unselectLink)
      .on('dimension.updated', ({ name, legend }) => {
        if (this.legend[name]) {
          this.legend[name] = legend.sort((a, b) => b.count - a.count)
        }
      })
    window.addEventListener('resize', this.onResize)
    this.graph.resize()
    this.updateGraph()
    if (this.itemsFiltered.length) {
      this.fadeinNodes(this.itemsFiltered)
    }
    if (this.itemsVisualized.length) {
      this.highlightNodes(this.itemsVisualized)
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      if (this.graph) {
        this.graph.resize()
      }
    },
    onMousemove({ pageX, pageY }) {
      const x = pageX - this.$refs.graph.parentNode.parentNode.parentNode.offsetLeft
      const y = pageY - this.$refs.graph.parentNode.offsetTop
      // const x = pageX - this.$refs.graph.offsetParent.offsetLeft; // - this.$refs.lines.offsetParent.offsetLeft;
      // const y = clientY;// );
      this.edgeTooltip = {
        ...this.edgeTooltip,
        x,
        y: y - 40
      }
    },
    handleToggleHighlighted(item) {
      console.info('handleToggleHighlighted', item)
      this.topicsStore.toggleVisualizedItem(item).then(isHighlighted => {
        if (isHighlighted && this.graph) {
          this.graph.zoomTo(item)
        }
        this.tooltip = {
          x: this.graph.width / 2 - 150,
          y: this.graph.height - 160,
          item,
          isHighlighted,
          isActive: true
        }
      })
    },
    fadeinNodes(nodes) {
      this.graph.assignClassToSVG('with-filters', {
        classed: this.applyCurrentSearchFilters
      })
      this.graph.assignClassToNodes(nodes, 'filtered', {
        assignToLinks: false
      })
    },
    selectLink(link) {
      clearTimeout(this.timerUnselectLink)
      this.selectedLink = link
      this.edgeTooltip = {
        ...this.edgeTooltip,
        isActive: true,
        fadeOut: false
      }
    },
    unselectLink() {
      clearTimeout(this.timerUnselectLink)
      this.edgeTooltip = {
        ...this.edgeTooltip,
        fadeOut: true
      }
      this.timerUnselectLink = setTimeout(() => {
        console.info('unselectLink delayed')
        this.selectedLink = null
        this.edgeTooltip = {
          ...this.edgeTooltip,
          isActive: false,
          fadeOut: false
        }
      }, 1000)
    },
    selectNode(node) {
      this.selectedNode = node
      this.tooltip = {
        x: this.graph.width / 2 - 150,
        y: this.graph.height - 160,
        item: node,
        isHighlighted: typeof this.visualizedItemsIndex[node.uid] !== 'undefined',
        isActive: true
      }
      this.graph.assignClassToSVG('selected')
      this.graph.assignClassToNodes([node], 'selected', {
        assignToLinks: true
      })
      this.graph.zoomTo(node)
    },
    unselectNode() {
      this.tooltip.isActive = false
      this.graph.assignClassToSVG('selected', { classed: false })
      this.graph.assignClassToNodes([], 'selected', {
        affectAllNodes: true,
        assignToLinks: true,
        classed: false
      })
    },
    highlightNodes(nodes) {
      this.graph.assignClassToSVG('with-highlights', {
        classed: nodes.length
      })
      this.graph.assignClassToNodes(nodes, 'highlight', {
        assignToLinks: true
      })
    },
    updateGraph() {
      // TODO: when nodes list is empty the graph code below throws
      // an error.
      // if (this.nodes.length === 0) return
      if (!this.graph) return
      this.graph.updateDimension({
        name: 'nodeColor',
        property: this.colorBy,
        values: this.nodes
      })
      this.graph.updateDimension({
        name: 'nodeSize',
        property: this.sizeBy,
        values: this.nodes
      })
      this.graph.update({
        nodes: this.nodes,
        links: this.links,
        pristine: true
      })
    },
    zoomReset() {
      this.graph.zoom()
    },
    async loadGraph() {
      if (this.isGraphLoading) {
        console.warn('loadGraph busy...')
        return
      }
      this.isGraphLoading = true
      this.nodes = await topicsGraph.find({}).finally(() => {
        this.isGraphLoading = true
      })
      this.updateGraph()
    }
  },
  watch: {
    colorBy(property) {
      this.graph.updateDimension({
        name: 'nodeColor',
        property,
        values: this.graph.nodes
      })
      this.graph.applyDimensions()
    },
    sizeBy(property) {
      this.graph.updateDimension({
        name: 'nodeSize',
        property,
        values: this.nodes
      })
      this.graph.applyDimensions()
    },
    itemsFiltered(items) {
      if (this.graph) {
        this.fadeinNodes(items)
      }
    },
    itemsVisualized: {
      handler(items) {
        if (this.graph) {
          this.loadGraph()
          this.highlightNodes(items)
        }
      },
      immediate: true,
      deep: true
    },
    applyCurrentSearchFilters() {
      if (this.graph) {
        this.fadeinNodes(this.itemsFiltered)
      }
    }
  },
  components: {
    InfoButton,
    Tooltip,
    TopicsExplorerTooltip
  }
}
</script>

<style lang="scss">
@-webkit-keyframes pulsate {
  0% {
    fill: transparent;
  }
  100% {
    fill: white;
  }
}

#d3-graph {
  line {
    stroke-linecap: round;
    &.highlight,
    &.selected {
      display: block;
    }
    &.selected {
      stroke: #ffeb78cc;
    }
    &.highlight {
      stroke: #e0e0e0;
    }
    &.highlight.selected {
      stroke: #ded49c;
    }
    &.selected:hover,
    &.highlight:hover,
    &.highlight.selected:hover {
      stroke: black;
    }
  }

  .nodes > .n:hover {
    .whoosh {
      transform: scale(10);
      transition: transform 0.6s cubic-bezier(0.8, -0.5, 0.2, 1.4);
    }

    &.v > .s > text,
    & > .s > text {
      fill: black;
      display: block;
    }
  }
  .nodes > .n > .s > text {
    pointer-events: none;
    display: none;
  }
  .nodes > .n.v .s > text {
    fill: grey;
    display: block;
  }
  .nodes > .n.highlight > .s {
    & > text {
      display: block;
    }
    .c {
      stroke-width: 2px;
      stroke: black;
    }
    .whoosh {
      fill: white;
      // transform: scale(3);
      // animation: pulsate 1s;
      // animation-iteration-count: infinite;
      // stroke-width: 1px;
      // stroke: black;
    }
  }

  .nodes > .n.selected > .s {
    & > text {
      display: block !important;
    }
    .c {
      stroke-width: 2px;
      stroke: black;
    }
  }

  svg.with-filters {
    .nodes > .n.v .s > text {
      display: none;
    }

    .nodes > .n {
      & > .s > .c,
      & > .s > .whoosh {
        opacity: 0.3;
      }

      &.highlight > .s > .c,
      &.highlight > .s > .whoosh,
      &.selected > .s > .c,
      &.filtered > .s > .c,
      &.filtered > .s > .whoosh {
        opacity: 1;
      }
    }
  }

  svg.with-selected {
    line {
      display: none;
    }
    line.selected {
      display: block;
      stroke: #c0c0c0;
    }
    .nodes > .n.highlight > .s {
      & > text {
        display: block;
      }
      .c {
        stroke-width: 2px;
        stroke: black;
      }
    }
    .nodes > .n.v > .s > text {
      display: none;
    }
  }
}
#ds3-graph {
  svg.with-highlights {
    .nodes .n .c {
      stroke-width: 2px;
      fill-opacity: 0;
    }
    .nodes .n.highlight {
      outline: 0;
    }
    .nodes .n.highlight .c {
      stroke-width: 3px;
      stroke: blue;
      fill-opacity: 1;
    }
    .nodes .n.highlight .whoosh {
      fill: blue;
    }
    .nodes .n.highlight text {
      display: block;
      fill: rgba(0, 0, 0, 0.7);
    }
  }
  svg.with-selected {
    .nodes .n.selected .c {
      stroke-width: 2px;
      stroke: black;
    }
    .nodes .n.highlight text {
      display: block;
      fill: rgba(0, 0, 0, 0.2);
    }
    .nodes .n.selected text {
      fill: black;
      display: block;
    }
  }
  .nodes .n.v text {
    fill: black;
    display: block;
  }
  line.selected {
    display: block;
    stroke: #c0c0c0;
  }
  line {
    stroke: rgba(0, 0, 0, 0.04);
    stroke-width: 1px;
  }
  text {
    pointer-events: none;
    display: none;
  }

  .nodes > g:hover {
    .whoosh {
      transform: scale(6);
      transition: transform 0.6s cubic-bezier(0.8, -0.5, 0.2, 1.4);
    }

    text {
      display: block;
    }
  }

  /* .nodes > g.fix, .nodes > g.v{
    text {
     display: block;
    }
  } */
}
.legend-node {
  width: 1rem;
  height: 1rem;
}
</style>
<i18n lang="json">
{
  "en": {
    "summary": "Explore the list of topics",
    "topics_cooccurrence_graph": "Graph of <span class='number'>{nodes}</span> topics",
    "zoom": "zoom: {k}%",
    "itemStats": "Highlight topics in current search ({count} filters)"
  }
}
</i18n>
