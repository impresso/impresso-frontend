<template>
<div id="app">
  <div id="app-header">
    <the-header />
  </div>
  <div id="app-content">
    <router-view />
  </div>
</div>
</template>

<script>
import WebFontLoader from 'webfontloader';
import TheHeader from './components/TheHeader';

export default {
  name: 'app',
  components: {
    TheHeader,
  },
  created() {
    // load typekit
    WebFontLoader.load({
      typekit: {
        id: process.env.TYPEKIT_ID,
      },
    });
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";
body,
html {
    height: 100%;
}
#app {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: min-content auto;
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

span.number {
  font-family: "questa-sans", sans-serif;
}
svg {
  text {
    font-family: "questa-sans", sans-serif;
  }
  // axis
  g.tick > line{
    stroke: $clr-tertiary;
  }
  path.domain {
    stroke: $clr-quaternary;
  }
}
</style>
