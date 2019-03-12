<template lang="html">
  <transition name="fade">
    <b-alert show class="toast small-caps m-2 p-2 bg-light border-secondary drop-shadow">
      <b-progress :value="job.progress * 100" variant="info" height="3px" />
      <b-row align-v="center">
        <b-col cols="6">
          <div class="m-1">
            <!-- {{job}} -->
            {{ job.task }} (id:{{job.id}})
          </div>
        </b-col>
        <b-col class="text-right">
          <b-button variant="outline-danger m-1" size="sm">Stop</b-button>
          <b-button variant="outline-success m-1" size="sm">Export</b-button>
        </b-col>
      </b-row>
    </b-alert>
  </transition>
</template>

<script>
export default {
  props: ['job'],
};
</script>

<style lang="scss">
.toast {
  .fade-enter-active, .fade-leave-active {
    transition: opacity, transform 400ms ease-out;
  }
  .fade-enter, .fade-leave-to {
    transform: translateY(30px);
    opacity: 0;
  }
  .fade-enter-to, .fade-leave {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
