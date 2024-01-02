<template>
  <div>
    <span v-if="item.name">
      <b>{{ item.name }}</b> @{{ item.creator.username }}<br />
      {{ $t('dates.lastModifiedDate') }} {{ $d(item.lastModifiedDate, 'short') }}
    </span>
    <span v-else>{{ item.uid }}</span>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
    },
  },
}
</script>
