<template>
  <div class="d-flex">
    <div class="col">
      <div class="row" v-for="item in items" v-bind:key="item">
        <!-- aspect details go here -->
        {{item}}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam quas, doloremque quisquam nobis necessitatibus officia quasi adipisci numquam velit praesentium aliquam atque neque nulla nemo natus cupiditate rem reprehenderit molestias!
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    items: [...Array(10).keys()],
  }),
  props: ['query'],
};
</script>

<style lang="less">

</style>

<i18n>
{

}
</i18n>