<template lang="html">
  <div id="search-facets">
    <div class="m-2 p-2 border-top border-tertiary">
      <base-title-bar>{{ groupByLabel }} per year
        <div slot="options">
          <b-dropdown size="sm" variant="outline-primary"  :text="$t('label.daterange.pick')" class="m-2 filter-options">
            <b-item-dropdown right class="filter-opts">
              <div class="p-2">
                <label>{{$t('label.daterange.start')}}</label>
                <flat-pickr :config="{minDate, maxDate, allowInput: true}"  v-bind:value="daterange.start"  class="form-control"></flat-pickr>

                <label>{{$t('label.daterange.end')}}</label>
                <flat-pickr :config="{minDate, maxDate, allowInput: true}" v-bind:value="daterange.end" class="form-control"></flat-pickr>

                <b-button size="sm" variant="outline-primary">{{$t('actions.apply')}}</b-button>
              </div>
            </b-item-dropdown>
          </b-dropdown>
        </div>
        <div slot="description">
          compared with average quality per year
        </div>
      </base-title-bar>

    <timeline
          class='bg-light pb-2'
          :values="values"
          :domain="[startYear, endYear]" >
      <div slot-scope="tooltipScope">
        <div v-if="tooltipScope.tooltip.item">
          {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
          <b>{{ tooltipScope.tooltip.item.w }}</b> {{ groupByLabel }}
          <!-- <br />
          <span class="contrast" v-if="tooltipScope.tooltip.item.w1 > 0">
          &mdash; <b>{{ percent(tooltipScope.tooltip.item.w1, tooltipScope.tooltip.item.w) }}%</b>
          ({{ tooltipScope.tooltip.item.w1 }}) {{ contrastLabel }}
          </span> -->
        </div>
      </div>
    </timeline>
  </div>
    <div v-for="(facet, index) in facets" class="pt-1px border-top border-tertiary">
      <div class="px-3 py-2 border-top small">
        <base-title-bar>{{facet.type}}</base-title-bar>
        <ul v-if="facet.type === 'collection'" class="list-unstyled">
          <li v-for="bucket in facet.buckets" class="facet-filter">
            <div class="left">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'include')">{{bucket.item.name}} ({{$n(bucket.count)}})</a>
            </div>
            <div class="right pl-1">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'exclude')">Exclude</a>
            </div>
          </li>
        </ul>
        <ul v-if="facet.type === 'language'" class="list-unstyled">
          <li v-for="bucket in facet.buckets" class="facet-filter">
            <div class="left">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'include')">{{$t(`languages.${bucket.item.uid}`)}} ({{$n(bucket.count)}})</a>
            </div>
            <div class="right pl-1">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'exclude')">Exclude</a>
            </div>
          </li>
        </ul>
        <ul v-if="facet.type === 'topic'" class="list-unstyled">
          <li v-for="bucket in facet.buckets" class="facet-filter">
            <div class="left">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'include')">{{bucket.item.getHtmlExcerpt()}} ({{$n(bucket.count)}})</a>
            </div>
            <div class="right pl-1">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'exclude')">Exclude</a>
            </div>
          </li>
        </ul>
        <ul v-if="facet.type === 'newspaper'" class="list-unstyled">
          <li v-for="bucket in facet.buckets" class="facet-filter">
            <div class="left">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'include')">{{bucket.item.name}} ({{$n(bucket.count)}})</a>
            </div>
            <div class="right pl-1">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'exclude')">Exclude</a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import 'flatpickr/dist/flatpickr.css';
import flatPickr from 'vue-flatpickr-component';

import BaseTitleBar from './base/BaseTitleBar';
import Timeline from './modules/Timeline';


export default {
  props: {
    startYear: {
      type: Number,
      default: 1737,
    },
    endYear: {
      type: Number,
      default: 2020,
    },
  },
  data: () => ({
    daterange: {
      isActive: true,
      start: new Date(),
      end: new Date(),
    },
    facetsOrder: ['language', 'newspaper', 'topic'],
  }),
  computed: {
    minDate() {
      return new Date(`${this.startYear}-01-01`);
    },
    maxDate() {
      return new Date(`${this.endYear}-12-31`);
    },
    groupByLabel: {
      get() {
        return this.$t(`groupBy.${this.$store.state.search.groupBy}`);
      },
    },
    values: {
      get() {
        const facet = this.$store.state.search.facets.find(d => d.type === 'year');
        if (!facet) {
          return [];
        }
        return facet.buckets.map(d => ({
          ...d,
          w: d.count,
          w1: 0,
          t: d.val,
        }));
      },
    },
    facets: {
      get() {
        return this.$store.state.search.facets.sort((a, b) => {
          const indexA = this.facetsOrder.indexOf(a.type);
          const indexB = this.facetsOrder.indexOf(b.type);

          if (indexA < indexB) {
            return -1;
          }

          if (indexA > indexB) {
            return 1;
          }

          return 0;
        });
      },
    },
  },
  methods: {
    submitFacet(facet, bucket, context = 'include') {
      if (facet.type === 'topic') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          h: bucket.val,
          q: bucket.val,
          context,
        });
      } else if (facet.type === 'newspaper') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          context,
        });
      } else if (facet.type === 'language') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          context,
        });
      } else if (facet.type === 'collection') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          context,
        });
      }
    },
  },
  components: {
    BaseTitleBar,
    Timeline,
    flatPickr,
  },
};
</script>

<style scoped lang="scss">
.facet-filter{
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-areas: "left" "right";
  .left{
    grid-area: "left"
  }
  .right{
    opacity: 0;
    grid-area: "right"
  }
  &:hover{
    .right{
      opacity: 1;
    }
  }
}

.filter-opts{
  position: absolute;
  width: 240px;
  left: auto;
  right: -1px;
  top: -2px;
  background: white;
  border: 1px solid;
  box-shadow: 0.3em 0.3em 0 rgba(17, 17, 17, 0.2);
}

</style>
<i18n>
  {
    "en": {
      "label": {
        "daterange": {
          "pick": "choose dates ...",
          "start": "from",
          "end": "to"
        }
      },
      "groupBy": {
        "articles": "articles"
      }
    }
  }
</i18n>
