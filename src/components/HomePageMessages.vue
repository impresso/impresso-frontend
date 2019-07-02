<template lang="html">
  <div>
    <div
      v-for="(message, i) in content.messages"
      v-bind:key="i"
      v-bind:class="`bg-${message.type || 'info'}`">
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
  data: () => ({
    content,
  }),
};
</script>

<style lang="scss" scoped>
</style>
