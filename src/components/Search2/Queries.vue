<template>
  <i-layout-section>
    <b-tabs card slot="header" content-class="d-none">
      <template slot="tabs">
        <b-nav-item
          href="#"
          v-on:click="() => {}">+</b-nav-item>
        <b-nav-item
          href="#"
          v-on:click="() => {}"
          active>Query 1</b-nav-item>
        <b-nav-item
          href="#"
          v-on:click="() => {}">Query 2</b-nav-item>
      </template>
    </b-tabs>
    <div class="p-3">
      <div v-for="i in [1,2,3,4,5,6,7,8,9,10]">
      <h1>yo</h1>
      <h1>yo</h1>
      <h1>yo</h1>
      <h1>yo</h1>
    </div>
    </div>
  </i-layout-section>
</template>

<script>
  export default {

  };
</script>

<style lang="scss" scoped>

</style>
