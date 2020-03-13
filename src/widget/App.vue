<template>
  <div class="h-100 v-100">
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.h-100 {
  height: 100%!important;
}

.v-100 {
  width: 100%!important;
}
body,html{
  height: 100%;
  margin: 0;
}

body{
  background:none transparent;
}

.position-fixed{
  position: fixed;
}
</style>
