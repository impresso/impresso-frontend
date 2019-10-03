<template>
  <div class="px-0 py-2 container">

    <!-- title and type -->
    <div v-if="title && type && !icon" class="row px-2 pb-2 justify-content-between">
      <div class="col-auto align-self-start">
        <h3 v-if="title">{{title}}</h3>
      </div>
      <div class="col-auto align-self-start">
        <div v-if="type" class="badge badge-secondary type d-flex">
          <span class="small-caps d-flex">{{type}}</span>
        </div>
      </div>
    </div>

    <!-- icon -->
    <div v-if="icon" class="row px-2 pb-2 justify-content-center">
      <div class="col-auto align-self-center">
        <span v-bind:class="`icon dripicons dripicons-${icon}`"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({}),
  props: ['title', 'type', 'icon'],
};
</script>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

  .type {
    .small-caps {
      height: 17px;
      vertical-align: top;
    }
  }
  .icon {
    font-size: 1.7em;
  }
</style>

<i18n>
{

}
</i18n>