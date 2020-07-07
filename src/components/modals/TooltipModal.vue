<template lang="html">
  <b-modal
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </b-modal>
</template>

<script>
export default {
}
</script>
