<template lang="html">
  <div
    ref="timeline"
    class="timeline"
    :style="`height: ${heightString};`"/>
</template>

<script>
import SimpleTimelineWithSelectionSpan from '@/d3-modules/SimpleTimelineWithSelectionSpan'

export default {
  props: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: () => new Date()
    },
    spanStartDate: {
      type: Date
    },
    spanEndDate: {
      type: Date
    },
    height: Number
  },
  computed: {
    timelineSpan() {
      return [this.startDate, this.endDate]
    },
    selectionSpan() {
      return [this.spanStartDate, this.spanEndDate]
    },
    heightString() {
      return this.height == null ? 'auto' : `${this.height}px`
    }
  },
  mounted() {
    this.timeline = new SimpleTimelineWithSelectionSpan({
      element: this.$refs.timeline,
      margin: { left: 4, right: 4 }
    })
    this.updateTimelineData()
  },
  methods: {
    updateTimelineData() {
      const [start, end] = this.timelineSpan
      const [selectionStart, selectionEnd] = this.selectionSpan
      const { height } = this.height
      this.timeline.update({ start, end, selectionStart, selectionEnd, height })
    }
  },
  watch: {
    timelineSpan() { this.updateTimelineData },
    selectionSpan() { this.updateTimelineData },
    height() { this.updateTimelineData }
  }
}
</script>

<style lang="scss" scoped>
  .timeline {
    width: 100%;
    // border: 1px solid #333;
  }
</style>
