<template lang="html">
  <div class="tooltip" v-bind:class='{active: tooltip.isActive}' v-bind:style="style">
    <div v-if='tooltip.item' class="tooltip-inner p-3 m-2">
      <label>{{ $t('topic')}} &mdash; {{tooltip.item.model}}</label>
      <div v-html="$tc('numbers.articles', tooltip.item.countItems, {
        n: $n(tooltip.item.countItems),
      })"/>
      <div>
        <span class='badge'> {{tooltip.item.language}}</span>
        <b class='sans-serif'>{{excerpt}} ...</b>

        <a class='mt-3  btn btn-outline-primary btn-sm btn-block' v-on:click.prevent.stop="selectItem()">
          <span v-if="isLoading">{{ $t('loading') }}</span>
          <span v-else>{{ $t('actions.more') }}</span>
        </a>
        <!-- router-link :to="{ name: 'topic', params: { topic_uid: tooltip.item.uid} }" class="mt-3 btn-block btn btn-outline-primary btn-sm">related articles</router-link> -->
      </div>
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
    selectItem() {
      if (this.isLoading) {
        console.warn('Topic tooltip still loading Topic item...');
        return;
      }
      this.isLoading = true;
      this.$store.dispatch('topics/LOAD_TOPIC', this.tooltip.item.uid).then((item) => {
        this.isLoading = false;
        this.tooltip.isActive = false;
        this.$store.dispatch('monitor/SET_ITEM', {
          item,
          type: 'topic',
        });
      });
    },
  },
};
</script>

<style scoped lang="less">
.tooltip{
  position: absolute;
  top: 0;
  pointer-events: none;

  a.btn{
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
