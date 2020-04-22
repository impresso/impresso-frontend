<template>
  <div>[collection recommendations "{{collectionId}}"]</div>
</template>

<script>
export default {
  props: {
    collectionId: {
      type: String,
      required: true
    }
  }
}
</script>