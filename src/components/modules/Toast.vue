<template lang="html">
  <b-alert show fade variant="info" class="toast small-caps m-0 px-3 py-1 border-0 border-bottom-1">
    <b-progress :value="job.progress * 100" variant="info" height="2px" />
    <b-row align-v="center">
      <b-col cols="6">
        <div class="m-1">
          {{job}}
          {{ job.task }} (id:{{job.id}})
        </div>
      </b-col>
      <b-col class="text-right">
        <b-button variant="outline-danger m-1" size="sm">Stop</b-button>
        <b-button variant="outline-success m-1" size="sm" v-on:click="onExport()">Export</b-button>
      </b-col>
    </b-row>
  </b-alert>
</template>

<script>
import * as services from '@/services';

export default {
  props: ['job'],
  methods: {
    onExport() {
      const anchor = document.createElement('a');
      document.body.appendChild(anchor);
      const file = `/media/jobs/${this.job.id}`;

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${services.app.passport.storage['feathers-jwt']}`);

      fetch(file, { headers })
        .then(response => response.blob())
        .then((blobby) => {
          const objectUrl = window.URL.createObjectURL(blobby);

          anchor.href = objectUrl;
          anchor.download = `impresso-job-${this.job.id}.csv`;
          anchor.click();

          window.URL.revokeObjectURL(objectUrl);
        });
    },
  },
  // mounted() {
  //   console.log(services.app.passport.storage['feathers-jwt']);
  //   services.app.authenticate().then((res) => {
  //     console.log(res);
  //   });
  // },
};
</script>

<style lang="scss">
.toast {
}
</style>
