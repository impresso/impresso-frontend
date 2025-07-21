<template>
  <div class="mention-item item">
    <blockquote v-html="item.context" />
    <b-row>
      <b-col>
        <div v-if="item.confidenceNel != null">
          <span class="small-caps">NEL confidence</span>
          <span>{{ item.confidenceNel.toFixed(2) }}%</span>
        </div>
      </b-col>
      <b-col>
        <div v-if="item.confidenceNer != null">
          <span class="small-caps">NER confidence</span>
          <span>{{ item.confidenceNer.toFixed(2) }}%</span>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { EntityMention } from '@/models/generated/schemas'
import { PropType } from 'vue'

export default {
  props: {
    item: Object as PropType<EntityMention>
  }
}
</script>

<style lang="css">
blockquote span[ref='match'] {
  background-color: gold;
}
</style>
