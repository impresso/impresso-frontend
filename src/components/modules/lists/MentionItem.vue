<template lang="html">
  <div class="mention-item item">
    <blockquote v-html="item.context" />
    <b-row>
      <b-col>
        <div v-if="item.fn == null">
          <span class="small-caps">Function</span>
          <span>{{item.fn}}</span>
        </div>
      </b-col>
      <b-col>
        <div v-if="item.confidence == null">
          <span class="small-caps">Confidence</span> <span>o{{$t(`confidence.${item.confidence}`)}}</span>
        </div>
      </b-col>
      <b-col>
        <div v-if="item.demonym == null">
          <div class="small-caps">demonym</div>
          {{item.demonym}}
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: {
    item: Object,
    required: true,
  },
};
</script>

<style lang="css">
blockquote span[ref=match]{
  background-color: gold;
}
</style>
