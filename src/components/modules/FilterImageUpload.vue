<template lang="html">
  <div>
    <b-media v-show="image.thumbnail">
      <div style="width:128px;" slot="aside">
        <b-img
          fluid-grow
          slot="aside"
          rounded
          v-bind:src="`data:image/png;base64,${image.thumbnail}`" />
      </div>
      <h4>Filename</h4>
      <p><small>{{image.name}}</small></p>
      <h4>Upload date</h4>
      <p><small>{{$d(image.creationDate, 'long')}}</small></p>
      <b-button variant="danger" size="sm" v-on:click="remove">Remove</b-button>
    </b-media>
    <file-pond v-bind:handler="handler" />
  </div>
</template>

<script>
import Vue from 'vue';
import FilePond from '@/components/modules/FilePond';
import { uploadedImages } from '@/services';

export default {
  data: () => ({
    handler: new Vue(),
    options: {
      server: {
        process: `${process.env.MIDDLELAYER_API}/filepond`,
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
      uploadedImages.get(val).then((res) => {
        this.$emit('load');
        this.image = res;
        this.handler.$emit('destroy');
      });
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
