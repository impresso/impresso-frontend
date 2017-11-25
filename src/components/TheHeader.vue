<template lang="html">
  <header id="header" class="py-2">
    <div class="container">
      <router-link :to="{name: 'home'}" class="logo">impresso</router-link>
    </div>
  </header>
</template>

<script>
export default {

};
</script>

<style scoped lang="less">
header {
    background: #234;
    color:white;
    .logo{
      color:white;
      font-weight: lighter;
      font-size: smaller;
    }
}
</style>
