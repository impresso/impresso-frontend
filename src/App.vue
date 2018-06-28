<template>
<div id="app">
  <the-header id="app-header" />
  <div id="app-content">
    <router-view />
  </div>
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
@import "./assets/less/style.less";
body,
html {
    height: 100%;
}
#app {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 50px auto;
    grid-template-areas: "appheader" "appcontent";
    height: 100%;
    #app-header {
        grid-area: appheader;
    }

    #app-content {
        grid-area: appcontent;
        overflow-y: auto;
        position: relative;
    }
}
</style>
