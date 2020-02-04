<template>
  <div>
    {{passage.id}}
  </div>
</template>

<script>
export default {
  props: {
    passage: {
      type: Object,
      required: true
    }
  }
}
</script>