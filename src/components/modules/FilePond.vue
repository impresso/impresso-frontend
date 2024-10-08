<template lang="html">
  <div class="filepond"></div>
</template>

<script>
import * as FilePond from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

import 'filepond/dist/filepond.min.css';

FilePond.registerPlugin(FilePondPluginFileValidateType);
FilePond.registerPlugin(FilePondPluginFileValidateSize);

export default {
  data: () => ({
    files: [],
    filepond: null,
  }),
  props: {
    handler: {
      required: true,
      type: Object,
    },
  },
  mounted() {
    if (this.handler) {
      this.handler.on('init', (options = {}) => {
        this.filepond = FilePond.create(
          this.$el,
          options,
        );
      });

      this.handler.on('dispatch', (cb) => {
        if (cb && this.filepond) {
          cb.call(null, this.filepond);
        }
      });

      this.handler.on('destroy', () => {
        this.destroy();
      });
    }
  },
  methods: {
    destroy() {
      this.files = [];

      if (this.filepond) {
        FilePond.destroy(this.$el);
      }
    },
  },
  beforeUnmount() {
    this.destroy();
  },
};
</script>

<style lang="css" scoped>
</style>
