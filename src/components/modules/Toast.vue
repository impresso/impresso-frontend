<template lang="html">
  <b-alert show fade variant="dark"
    class="toast m-0 py-0 px-2">
    <b-progress
      v-if="job.progress < 1"
      :value="(job.progress * 100) + 1"
      variant="info"
      animated
      height="2px" />
    <b-row align-v="center">
      <b-col cols="8">
        <div class="m-1">
          <div>
            <span v-if="job.type">{{ $t(`jobs.type.${job.type}`) }}</span>
            <span v-else>{{ $t(`jobs.type.${job.task}`) }}</span>
            <b-badge>{{ $t(`jobs.status.${job.status}`) }}</b-badge>
          </div>
          <div v-if="job.extra">
            <span>{{ percent(job.extra.progress) }} &mdash; </span>
            <span class='date' v-if="job.creationDate"> {{$d(new Date(job.creationDate), 'precise')}}</span>
          </div>
          <div v-else>
            <span >{{ percent(job.progress) }}</span>
          </div>
        </div>
      </b-col>
      <b-col cols="4" class="text-right">
        <b-button
          v-if="job.status === 'RUN'"
          variant="outline-danger m-1" size="sm"
          v-on:click="onStopJob(job.id)">Stop
        </b-button>
        <b-button
          v-if="job.status === 'DON' && job.type === 'EXP'"
          variant="outline-success m-1" size="sm"
          v-on:click="onExport()">{{ $t('download csv') }}
        </b-button>
      </b-col>
    </b-row>
  </b-alert>
</template>

<script>
import * as services from '@/services';

export default {
  props: ['job'],
  methods: {
    percent(n) {
      const p = Math.min(100, Math.round(n * 10000) / 100);
      return `${p} %`;
    },
    onStopJob(id) {
      this.$store.dispatch('jobs/PATCH_JOB', {
        id,
        status: 'STOP',
      }).then((res) => {
        console.log('RECEIVED:', res);
      });
    },
    onExport() {
      const anchor = document.createElement('a');
      document.body.appendChild(anchor);
      const file = `${services.MIDDLELAYER_MEDIA_URL}/jobs/${this.job.id}`;
      console.log('downloading:', file);
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
@import "impresso-theme/src/scss/variables.sass";

$clr-grey-800: #c6ccd2;

.toast {
}

.alert-dark{
  color: $clr-grey-800;
  background-color: transparent;
  border-color: transparent;
}

</style>

<i18n>
{
  "en": {
    "jobs": {
      "type": {
        "EXP": "export search results as csv",
        "IDX": "Indexing collection items",
        "store_collectable_items": "Indexing collection items",
        "TES": "Echo (TEST)",
        "test": "Echo (TEST)",
        "BCQ": "Saving items in your collection",
        "execute_solr_query": "Saving items in your collection"
      },
      "status": {
        "DON": "done",
        "RUN": "progress",
        "ERR": "error"
      }
    }
  }
}
</i18n>
