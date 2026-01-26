<template>
  <div class="h-100 v-100">
    <router-view class="h-100 v-100" />
  </div>
</template>

<style lang="scss">
#app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
}

body,
html {
  height: 100%;
  margin: 0;
}

.h-100 {
  height: 100% !important;
}

.v-100 {
  width: 100% !important;
}
</style>
