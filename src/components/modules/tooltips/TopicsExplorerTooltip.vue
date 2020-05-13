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
      <div v-html="$tc('numbers.articles', tooltip.item.countItems, {
        n: $n(tooltip.item.countItems),
      })"/>
      <div  v-html="$tc('numbers.relatedTopics', tooltip.item.degree)" />

      <b-button-group class="my-2">
        <!-- <b-button variant="outline-success"  size="sm"
          v-on:click.prevent.stop="highlightItem">
            <span v-if="isLoading">{{ $t('actions.loading') }}</span>
            <span v-else>{{ $t('actions.more') }}</span>
        </b-button> -->
        <b-button variant="outline-primary" block size="sm"
          @click.prevent.stop="highlightItem">
          <div class="d-flex align-items-center">
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
      </b-button-group>

      <b-button variant="outline-primary" block size="sm" @click.prevent.stop="selectItem">
        <span v-if="isLoading">{{ $t('actions.loading') }}</span>
        <span v-else>{{ $t('actions.more') }}</span>
      </b-button>
    </div>
  </div>
</template>

<script>
import Topic from '@/models/Topic';

export default {
  model: {
    prop: 'tooltip',
    default: {
      x: 0,
      y: 0,
      count: 0,
      isActive: false,
      isHighlighted: false,
      item: new Topic(),
    },
  },
  props: ['tooltip', 'isActive'],
  data: () => ({
    isLoading: false,
  }),
  computed: {
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
      this.$store.dispatch('topics/LOAD_TOPIC', this.tooltip.item.uid).then((item) => {
        this.isLoading = false;
        this.tooltip.isActive = false;
        this.$store.dispatch('monitor/ACTIVATE', {
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
