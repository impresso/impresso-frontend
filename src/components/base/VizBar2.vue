<template lang="html">
  <div>
    {{items}}

    <div class="w-100 bg-white">
      <div
        v-for="(item, index) in items" :key="index"
        class="bg-accent border-right border-primary d-inline-block"
        :style="`height:2px; width:${item.count}%;`" />{{item.name}}
    </div>

  </div>
</template>

<script>
export default {
  props: [
    'items', // array [{'name', 'count'}]
  ],
  methods: {
    percent(count) {
      return count.toString(2);
    },
  },
  components: {
  },
  computed: {
  },
};
</script>
