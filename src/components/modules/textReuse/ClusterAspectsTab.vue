<template>
  <b-nav tabs class="tabbed-nav pl-2 pt-1 align-items-end">
    <b-nav-item class="small-caps" :active="true">
      {{$tc('tabs.passages', passagesCount, { count: passagesCount })}}
    </b-nav-item>
  </b-nav>
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