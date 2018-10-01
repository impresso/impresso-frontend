<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right pt-2">
      <div slot="header">
        <base-tabs v-model="tab" v-bind:tabs="tabs"></base-tabs>
      </div>
      <div class="p-4">
        <p>With a lot of content in body slot to demonstrate scrollbar</p>
        <div v-for="t in tabs" v-show="t === tab">
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
          <pre>{{t}}</pre>
        </div>
      </div>
      <div slot="footer">
        <b-btn variant="primary">Yo</b-btn>
      </div>
    </i-layout-section>
    <i-layout-section width="400px" class="border-right pt-2">
      <div slot="header">
        <base-tabs v-model="tab" v-bind:tabs="tabs"></base-tabs>
      </div>
      <div class="p-4">
        <p>Without a lot of content in body slot to demonstrate Stickyness of the header and footer</p>
        <pre>{{tab}}</pre>
      </div>
      <div slot="footer">
        <b-btn variant="primary">Yo</b-btn>
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
      <base-tabs v-model="tab" v-bind:tabs="tabs"></base-tabs>
      <div v-for="t in tabs" v-show="t === tab" class="p-4">
        <p>Or put eveything in body to prevent Stickyness</p>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
        <pre>{{t}}</pre>
      </div>
        <b-btn variant="primary">Yo</b-btn>
    </i-layout-section>
  </i-layout>
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
