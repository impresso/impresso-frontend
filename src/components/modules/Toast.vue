<template lang="html">
  <b-alert show fade variant="info" class="toast small-caps m-0 px-3 py-1 border-0 border-bottom-1">
    <b-progress :value="job.progress * 100" variant="info" height="2px" />
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
</template>

<script>
export default {
  props: ['job'],
};
</script>

<style lang="scss">
.toast {
}
</style>
