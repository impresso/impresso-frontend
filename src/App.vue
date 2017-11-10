<template>
<div id="app">
  <the-header/>
  <router-view/>
</div>
</template>

<script>
import TheHeader from './components/TheHeader';

export default {
  name: 'app',
  components: {
    theHeader: TheHeader,
  },
};
</script>

<style lang="less">
#app {}
</style>
