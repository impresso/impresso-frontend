<template lang="html">
  <div>
    <b-media v-show="image.thumbnail">
      <div style="width:128px;" slot="aside">
        <b-img
          fluid-grow
          slot="aside"
          v-bind:src="`data:image/png;base64,${image.thumbnail}`" />
      </div>
      <p>
        <b>{{image.name}}</b>
        <div class="date">{{ $d(image.creationDate, 'long') }}</div>
      </p>
      <b-button variant="outline-primary" size="sm" v-on:click="remove">{{ $t('actions.remove') }}</b-button>
    </b-media>
    <file-pond v-bind:handler="handler" />
  </div>
</template>

<script>
import Vue from 'vue';
import FilePond from '@/components/modules/FilePond';
import { uploadedImages } from '@/services';

const MiddleLayerApiBase = process.env.MIDDLELAYER_API || window.location.hostname;

const FILEPOND_SERVICE_PATH = [
  process.env.MIDDLELAYER_API_PATH,
  '/filepond',
].join('/').replace(/\/\/+/g, '/');

console.info('Current host:', MiddleLayerApiBase, 'filepond path:', FILEPOND_SERVICE_PATH);

export default {
  data: () => ({
    handler: new Vue(),
    options: {
      server: {
        url: MiddleLayerApiBase,
        process: FILEPOND_SERVICE_PATH,
        fetch: null,
        revert: null,
      },
      name: 'filepond',
      maxFileSize: '5MB',
    },
    image: false,
  }),
  methods: {
    init() {
      this.handler.$emit('init', (this.options));
      this.handler.$emit('dispatch', (pond) => {
        pond.onprocessfile = (error, file) => {
          console.info('File processed', file.filename, file.fileType, file.serverId);
          this.$store.commit('searchImages/UPDATE_SIMILAR_TO_UPLOADED', file.serverId);
          this.$store.commit('searchImages/UPDATE_SIMILAR_TO', false);
          this.loadImage(file.serverId);
        };
      });
    },
    remove() {
      this.image = false;
      this.$store.commit('searchImages/UPDATE_SIMILAR_TO_UPLOADED', false);
      this.$emit('remove');
      this.handler.$emit('destroy');
      this.init();
    },
    loadImage(val) {
      console.info('loadImage: ', val);
      if (val && val.length) {
        uploadedImages.get(val).then((res) => {
          this.$emit('load');
          this.image = res;
          this.handler.$emit('destroy');
        });
      } else {
        console.error('loadImage failed, no image id has been provided');
      }
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    '$route.query.u': { // user uploaded image id
      handler(val) {
        if (val === undefined) {
          this.remove();
        } else {
          this.loadImage(val);
        }
      },
      immediate: true,
    },
  },
  components: {
    FilePond,
  },
};
</script>

<style lang="scss" scoped>
</style>
