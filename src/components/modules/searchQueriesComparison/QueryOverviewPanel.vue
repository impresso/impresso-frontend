<template>
  <div class="d-flex">
    <div class="col">
      <div class="row" v-for="item in items" v-bind:key="item">
        <!-- aspect details go here -->
        <!-- {{item}}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam quas, doloremque quisquam nobis necessitatibus officia quasi adipisci numquam velit praesentium aliquam atque neque nulla nemo natus cupiditate rem reprehenderit molestias! -->
        <stacked-bars-panel
          v-bind:label="`panel ${item}`"
          v-bind:items="generateItems(Math.round(Math.random() * 10 + 1))"/>
      </div>
    </div>
  </div>
</template>

<script>
import StackedBarsPanel from '../vis/StackedBarsPanel';

export default {
  data: () => ({
    items: [...Array(10).keys()],
  }),
  props: ['query'],
  components: {
    StackedBarsPanel,
  },
  methods: {
    generateItems(n) {
      return [...Array(n).keys()].map(idx => [`item ${idx}`, Math.random() * 100]);
    },
  },
};
</script>

<style lang="less">

</style>

<i18n>
{

}
</i18n>