<template>
  <div class="px-2 pb-2 py-2 container">

    <!-- title and type -->
    <div v-if="title && type && !icon" class="row justify-content-between">
      <div class="col-auto align-self-start">
        <h3 v-if="title">{{title}}</h3>
      </div>
      <div class="col-auto align-self-start">
        <div v-if="type" class="badge badge-secondary type d-flex">
          <span class="small-caps d-flex">{{type}}</span>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-auto">{{total}} articles</div>
    </div>

  </div>
</template>

<script>
export default {
  data: () => ({}),
  props: ['title', 'type', 'total'],
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