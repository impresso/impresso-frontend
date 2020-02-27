<template>
  <b-tabs pills class="mx-3">
    <template v-slot:tabs-end>
      <b-nav-item class="pl-2" :active="true">
        {{$tc('tabs.passages', passagesCount, { count: passagesCount })}}
      </b-nav-item>
    </template>
  </b-tabs>
</template>

<script>
export default {
  props: {
    passagesCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<i18n>
{
  "en": {
    "tabs": {
      "passages": "Passages | 1 Passage | {count} passages"
    }
  }
}
</i18n>
