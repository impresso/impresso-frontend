<template>
  <PowerVisBase :data="data" :loading="loading" @item:click="itemClicked">
    <template v-slot:header>
      <div>TextReuseOverview Header</div>
    </template>
    <template v-slot:footer>
      <div>TextReuseOverview Footer</div>
    </template>
  </PowerVisBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PowerVisBase from '@/components/modules/vis/PowerVisBase'

export default defineComponent({
  name: 'TextReuseOverview',
  components: {
    PowerVisBase
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const itemClicked = () => {}
    return { itemClicked }
  }
})
</script>