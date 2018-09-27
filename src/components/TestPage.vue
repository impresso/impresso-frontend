<template lang="html">
  <div class="container">
    <base-tabs v-model="tab" v-bind:tabs="tabs"></base-tabs>
    <div v-for="t in tabs" v-show="t === tab">
      {{t}}
    </div>
  </div>
</template>

<script>
import BaseTabs from './base/BaseTabs';

export default {
  data: () => ({
    tab: {},
    tabs: [
      {
        label: 'thijs',
      },
      {
        label: 'daniele',
        disabled: true,
      },
      {
        label: 'paul',
        active: true,
      },
    ],
  }),
  components: {
    BaseTabs,
  },
};
</script>
