<template>
  <li>
    <router-link :to="{ name: 'newspaper_metadata', params: { newspaper_uid: item.uid } }">
      <strong>{{ item.name }}</strong>
      <br />
      ({{ item.startYear }} - {{ item.endYear }})
    </router-link>
  </li>
</template>

<script>
export default {
  props: ['item'],
}
</script>
