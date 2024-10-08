<template>
  <div>
    <div v-show="image.thumbnail" class="media">
      <div class="media-aside align-self-start">
        <div style="width:128px;">
          <img
            fluid-grow
            :src="`data:image/png;base64,${image.thumbnail}`" />
        </div>
      </div>
      <div class="media-body">
        <p>
          <b>{{image.name}}</b>
          <span class="date">{{ $d(image.creationDate, 'long') }}</span>
        </p>
        <b-button variant="outline-primary" size="sm" v-on:click="remove">{{ $t('actions.remove') }}</b-button>
      </div>
    </div>
    <file-pond v-bind:handler="handler" />
  </div>
</template>

<script>
import mitt from 'mitt'
import FilePond from '@/components/modules/FilePond.vue';
import { uploadedImages } from '@/services';

const MiddleLayerApiBase = import.meta.env.VITE_MIDDLELAYER_API || window.location.hostname;

const FILEPOND_SERVICE_PATH = [
  import.meta.env.VITE_MIDDLELAYER_API_PATH,
  '/filepond',
].join('/').replace(/\/\/+/g, '/');

console.info('Current host:', MiddleLayerApiBase, 'filepond path:', FILEPOND_SERVICE_PATH);

export default {
  data: () => ({
    handler: mitt(),
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
      this.handler.emit('init', (this.options));
      this.handler.emit('dispatch', (pond) => {
        pond.onprocessfile = (error, file) => {
          console.info('File processed', file.filename, file.fileType, file.serverId);
          this.loadImage(file.serverId);
        };
      });
    },
    remove() {
      this.image = false;
      this.$emit('remove');
      this.handler.emit('destroy');
      this.init();
    },
    loadImage(val) {
      console.info('loadImage: ', val);
      if (val && val.length) {
        uploadedImages.get(val).then((res) => {
          this.$emit('load');
          this.image = res;
          this.handler.emit('destroy');
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
