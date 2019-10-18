<template lang="html">
  <b-alert show fade variant="dark"
    class="toast m-0 p-0 mb-2">
    <div class="toast-item d-flex align-items-center px-2">
      <div class="flex-grow-1 pr-2">
        <h2 class='text-white sans p-0 m-0'>{{ $t(`jobs.type.${job.type}`) }}</h2>
        <div class="date small-caps">{{$d(new Date(job.creationDate), 'precise')}} (#{{job.id}})</div>
        <blockquote v-if="job.extra.collection" class="pl-2 my-1 border-left small">
          <h3 class="text-white font-weight-bold sans p-0 m-0">
            <router-link v-if="job.extra.collection.status !== 'DEL'" :to="{ name: 'collection',
              params: {
                collection_uid: job.extra.collection.id
              }
            }" v-html="job.extra.collection.name" />
            <span v-else>
              <del  v-html="job.extra.collection.name"></del> ({{ $t('collection.deleted') }})
            </span>
          </h3>
          <span style="line-height:0.8" v-html="job.extra.collection.description" />
        </blockquote>
        <div>
          <span class='small-caps'>{{ $t(`jobs.status.${job.status}`) }}</span> &mdash;
          <span class='text-white'>{{ percent(job.progress) }}</span>
        </div>
      </div>
      <!-- buttons and actions! -->
      <div>
        <b-button
          v-if="job.status === 'DON' && job.type === 'EXP'"
          variant="outline-success m-1" size="sm"
          v-on:click="onExport()">{{ $t('download csv') }}
        </b-button>
        <b-button
          v-if="job.status === 'RUN'"
          variant="outline-danger m-1" size="sm"
          v-on:click="onStopJob(job.id)">Stop
        </b-button>
        <b-button
          v-if="job.status === 'DON' || job.status === 'STO'"
          variant="outline-danger m-1" size="sm"
          v-on:click="onStopJob(job.id)">{{ $t('actions.remove') }}
        </b-button>
      </div>
    </div>
    <!-- PERCENT -->
    <div v-if="job.status === 'RUN'" class="position-relative mx-2 mb-3">
      <b-progress
        :value="(job.progress * 100)"
        variant="info"
        animated
        height="4px"/>
      </div>
    </div>
  </b-alert>
</template>

<script>
import * as services from '@/services';

export default {
  props: ['job'],
  methods: {
    percent(n) {
      const p = Math.min(100, Math.round(parseFloat(n) * 10000) / 100);
      return `${p} %`;
    },
    onStopJob(id) {
      return this.$store.dispatch('jobs/PATCH_JOB', {
        id,
        status: 'stop',
      });
    },
    onExport() {
      const anchor = document.createElement('a');
      document.body.appendChild(anchor);
      const file = `${services.MIDDLELAYER_MEDIA_URL}/jobs/${this.job.id}`;
      console.info('downloading:', file);
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${services.app.authentication.options.storage['feathers-jwt']}`);

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
  //   console.info(services.app.passport.storage['feathers-jwt']);
  //   services.app.authenticate().then((res) => {
  //     console.info(res);
  //   });
  // },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

$clr-grey-800: #c6ccd2;

.toast {

  h2, h3{
    font-size: inherit;
  }
}

.alert-dark{
  color: $clr-grey-800;
  background-color: transparent;
  border-color: transparent;
  border-bottom: 1px solid #343a40;
}



</style>

<i18n>
{
  "en": {
    "collection": {
      "deleted": "removed."
    },
    "jobs": {
      "type": {
        "EXP": "export search results as csv",
        "DCO": "Deleting a collection",
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
        "ERR": "error",
        "STO": "stopped"
      }
    }
  }
}
</i18n>
