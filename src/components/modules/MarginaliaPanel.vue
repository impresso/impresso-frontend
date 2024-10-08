<template>
  <div :class="['marginalia-panel', isLeft ? 'left' : '']">
    <section class="p-3" v-for="(section, index) in sections" :key="index">
      <h4 class="small-caps border-bottom">{{section.title}}</h4>
      <ul>
        <li v-for="(item, itemIndex) in section.items" :key="itemIndex">{{item}}</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

interface Section {
  title: string;
  items: string[];
}

export default defineComponent({
  props: {
    /** @type {import('vue').PropOptions<Section[]>} */
    sections: {
      type: Array as PropType<Section[]>,
    },
    isLeft: Boolean
  }
})
</script>

<style lang="scss">

.marginalia-panel {
  &.left {
    text-align: right;
  }
  // background: $clr-accent;
  // border: 2px solid black;
  section {
    // max-width: 200px;
    font-size: 80%;
    color: #626e7a;
  }
  &.left {
    padding-right: 1em;
    text-align: right;
  }
  &.left section {
    right: 1em;
  }
  h4{
    font-weight: bold;
    padding-bottom: 1rem;
  }
  &.right {
    padding-left: 1em;
    text-align: left;
  }
  ul {
    list-style: none;
    padding: 0.5em 0;
  }
}

</style>
