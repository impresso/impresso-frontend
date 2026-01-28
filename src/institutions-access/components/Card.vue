<template>
  <div class="Card p-4">
    <header class="mb-3">
      <slot name="header" />
    </header>
    <main>
      <slot></slot>
    </main>
  </div>
</template>
<style>
.Card {
  position: relative;
  border-radius: var(--impresso-border-radius-lg);
  box-shadow: var(--bs-box-shadow-lg);
  background-color: #ffffff4a;
}
</style>
