<template>
  <div ref="lazyObserver"></div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LazyObserver',
  emits: ['onIntersect'],
  props: {
    delay: {
      type: Number,
      default: 5000,
    },
  },
  methods: {
    observe() {
      const observer = new IntersectionObserver(
        entries => {
          const [entry] = entries
          if (entry.isIntersecting) {
            this.$emit('onIntersect')
            observer.unobserve(this.$refs.lazyObserver)
          }
        },
        {
          rootMargin: '0px',
          threshold: 1.0,
        },
      )
      observer.observe(this.$refs.lazyObserver)
    },
  },
  mounted() {
    this.timeoutId = setTimeout(() => {
      this.observe()
    }, this.delay)
  },

  beforeUnmount() {
    clearTimeout(this.timeoutId)
  },
})
</script>
