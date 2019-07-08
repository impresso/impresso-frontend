<template lang="html">
  <div>
    <div
      v-for="(message, i) in messages"
      v-bind:key="i"
      v-show="message.show"
      v-bind:class="`bg-${message.type || 'info'}`">
      <a href="#" class="float-right dripicons dripicons-cross m-4 btn btn-link btn-sm" v-on:click.prevent="close(message)" />
      <div class="container py-4">
        <h4 v-html="message.title" />
        <div v-html="message.body" />
        <a
          v-for="(button, j) in message.buttons"
          v-bind:key="j"
          v-bind:target="button.target || '_self'"
          v-bind:href="button.src"
          v-bind:class="`btn-${button.type || 'info'}`"
          class="btn btn-sm mr-2">{{button.title}}</a>
      </div>
    </div>
  </div>
</template>

<script>
import content from '@/assets/homepage.json';

export default {
  computed: {
    messages: {
      get() {
        return content.messages.map(message => ({
          ...message,
          show: !localStorage.getItem(message.id),
        }));
      },
    },
  },
  methods: {
    close(message) {
      localStorage.setItem(message.id, true);
      message.show = false;
      this.$forceUpdate();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
