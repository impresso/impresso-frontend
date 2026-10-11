<template>
  <div class="Card">
    <header v-if="$slots.header" class="Card__header">
      <slot name="header" />
    </header>
    <div class="Card__body">
      <slot></slot>
    </div>
  </div>
</template>
<style>
.Card {
  position: relative;
  padding: 1.5rem 1.75rem 1.75rem;
  background-color: var(--impresso-color-white);
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--impresso-border-radius-sm);
}
.Card__header {
  margin-bottom: 1.15rem;
}
.Card__header h2:not(.small-caps) {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-wrap: balance;
}
</style>
