<template>
  <div class="h-100 v-100">
    <router-view class="h-100 v-100 wrapper" />
  </div>
</template>

<style lang="scss">
#app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
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

button {
  cursor: pointer;
  background-color: transparent;
  border: none;
}

.h-100 {
  height: 100% !important;
}

.v-100 {
  width: 100% !important;
}

.mb-0,
.my-0 {
  margin-bottom: 0 !important;
}
.mb-1,
.my-1 {
  margin-bottom: 0.25rem !important;
}
.mb-2,
.my-2 {
  margin-bottom: 0.5rem !important;
}
.pb-0,
.py-0 {
  padding-bottom: 0 !important;
}
.p-2 {
  padding: 0.5rem !important;
}
.p-3 {
  padding: 1rem !important;
}
.pl-3,
.px-3 {
  padding-left: 1rem !important;
}
.pl-2,
.px-2 {
  padding-left: 0.5rem !important;
}
.pb-2,
.py-2 {
  padding-bottom: 0.5rem !important;
}

body,
html {
  height: 100%;
  margin: 0;
}

h1 {
  margin: 0;
  padding: 0;
  font-size: inherit;
}
body {
  background: none transparent;
  font-family: sans-serif;
}

.position-fixed {
  position: fixed;
}

.position-absolute {
  position: absolute;
}

.bottom-0 {
  bottom: 0;
}
.left-0 {
  left: 0;
}
.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  .image {
    background-repeat: no-repeat;
    background-position: center;
    flex-grow: 1;
  }
  .caption {
    flex-shrink: 0;
  }
}
</style>
