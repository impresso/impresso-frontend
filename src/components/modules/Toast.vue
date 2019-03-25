<template lang="html">
  <b-alert show fade variant="dark"
    class="toast m-0 p-1 bg-dark text-white border-bottom-0 border-left-0 border-right-0 border-secondary">
    <b-progress
      v-if="job.progress < 1"
      :value="(job.progress * 100) + 1"
      variant="info"
      animated
      height="2px" />
    <b-row align-v="center">
      <b-col cols="8">
        <div class="m-1">
          <div v-if="job.extra">
            {{ $t(job.extra.task) }} (id:{{job.id}})
          </div>
          <div v-else>
            {{ $t(job.task) }} (id:{{job.id}})
          </div>
          <!-- {{job}} -->
          <div class="small-caps" v-if="job.creationDate">
            {{$d(new Date(job.creationDate), 'precise')}}
          </div>
        </div>
      </b-col>
      <b-col class="text-right">
        <b-button v-if="job.status === 'RUN'" variant="outline-danger m-1" size="sm">Stop</b-button>
        <b-button v-if="job.status === 'DON'" variant="outline-success m-1" size="sm" v-on:click="onExport()">Export</b-button>
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

<i18n>
{
  "en": {
    "execute_solr_query": "Constructing collection",
    "store_collectable_items": "Indexing collection items"
  }
}
</i18n>
