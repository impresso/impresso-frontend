<template lang="html">
  <div class="tooltip" v-bind:class='{active: tooltip.isActive}' v-bind:style="style">
    <div v-if='tooltip.item' class="tooltip-inner p-3 m-2">
      <label>{{ $t('topic')}} &mdash; {{tooltip.item.model}}</label>
      <!-- excerpt -->
      <div>
        <span class='badge'> {{tooltip.item.language}}</span>
        <b class='sans-serif'>{{excerpt}} ...</b>
      </div>
      <!--  number of related -->
      <div>
        <span v-html="$tc('numbers.articles', tooltip.item.countItems, {
          n: $n(tooltip.item.countItems),
        })"/> &middot;
        <span  v-html="$tc('numbers.relatedTopics', tooltip.item.degree)" />
      </div>
      <b-button-group class="my-2 w-100">
        <b-button class="mr-1" @click="$router.push({name: 'topic', params: { topic_uid: tooltip.item.uid }})" variant="outline-success"  size="sm">
            {{ $t('actions.viewTopic') }}
        </b-button>
        <b-button class="ml-1" @click="$router.push(searchRouteLink)" variant="outline-success"  size="sm">
            {{ $t('actions.searchMore') }}
        </b-button>
      </b-button-group>
        <b-button block variant="outline-primary"  size="sm"
          @click.prevent.stop="highlightItem">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span v-if="tooltip.isHighlighted">{{ $t('actions.highlightItemOff') }}</span>
              <span v-else>{{ $t('actions.highlightItemOn') }}</span>
            </div>
            <div class="d-flex dripicons ml-2" :class="{
              'dripicons-preview': !tooltip.isHighlighted,
              'dripicons-minus': tooltip.isHighlighted,
            }" />
          </div>
        </b-button>
    </div>
  </div>
</template>

<script>
import Topic from '@/models/Topic';
import { serializeFilters } from '@/logic/filters';
import { CommonQueryParameters } from '@/router/util';
import { mapStores } from 'pinia'
import { useMonitorStore } from '@/stores/monitor'
import { topics as topicsService } from '@/services'

export default {
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0,
        count: 0,
        isActive: false,
        isHighlighted: false,
        item: new Topic(),
      })
    },
    isActive: Boolean,
  },
  data: () => ({
    isLoading: false,
  }),
  computed: {
    tooltip() { return this.modelValue },
    ...mapStores(useMonitorStore),
    searchRouteLink() {
      return {
        name: 'search',
        query: {
          [ CommonQueryParameters.SearchFilters ]: serializeFilters([{
            type: 'topic',
            q: this.tooltip.item.uid,
          }]),
        },
      };
    },
    style() {
      return {
        transform: `translate(${this.tooltip.x}px,${this.tooltip.y}px`,
      };
    },
    excerpt() {
      return this.tooltip.item ? this.tooltip.item.excerpt.map(d => d.w).join(' · ') : '';
    },
  },
  methods: {
    highlightItem() {
      this.$emit('toggle-highlighted', this.tooltip.item);
    },
    selectItem() {
      if (this.isLoading) {
        console.warn('Topic tooltip still loading Topic item...');
        return;
      }
      this.isLoading = true;
      topicsService.get(this.tooltip.item.uid, { fl: 'id' })
        .then(result => new Topic(result))
        .then((item) => {
          this.isLoading = false;
          this.tooltip.isActive = false;
          this.monitorStore.activate({
            item,
            type: 'topic',
            disableFilterModification: true
          });
        }).catch(() => {
          this.isLoading = true;
        });
    },
  },
};
</script>

<style scoped lang="less">
.tooltip{
  position: absolute;
  top: -50px;
  pointer-events: none;
  .btn{
    pointer-events: auto;
  }
  // width: 300px;
  .btn.btn-outline-primary{
    border-color: white;
    pointer-events: auto;
    color: white;

    &:hover{
      background-color: white;
      color: black;
    }
  }
  .tooltip-inner{
    background: black;
    color: white;
    text-align: left;
    max-width: 300px;
  }
  &.active{
    opacity: 1;
  }
}
// @tt_width: 100px;
// @tt_margin_h: 6px;
// @tt_margin_v: 3px;
//
// .tooltip{
//   ::before{
//     content: "";
//     display: block;
//     width: 10px;
//     height: 10px;
//     position: absolute;
//     top:44px;
//     left: @tt_width / 2 - @tt_margin_h;
//     transform: rotate(45deg);
//     background: black;
//   }
//
//   &.active{
//     opacity: 1;
//   }
//
//   position: absolute;
//   top: 0;
//   z-index: 100;
//   background: black;
//   border-radius: 3px;
//   color: white;
//   pointer-events: none;
//   width: @tt_width;
//   height: 50px;
//   margin-top: -56px;
//   margin-left: -1 * (@tt_width / 2);
//   font-size: .8em;
//   padding:3px 6px;
//   .year{
//     display: block;
//     font-weight: bold;
//     opacity: .8;
//   }
//   .count{
//
//   }
// }
</style>
