<template lang="html">
  <div class="spinner">
    <span />
  </div>
</template>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

.spinner > span,
.spinner:after,
.spinner:before {
  content: '';
  width: 1em;
  height: 1em;
  margin: 0.2em;
  background-color: $clr-secondary;
  opacity: 0.5;
  border-radius: 50%;
  display: inline-block;
  animation: bouncedelay 1.2s infinite ease-in-out both;
}
.spinner:before {
  animation-delay: 0s;
}
.spinner > span {
  animation-delay: -0.4s;
}
.spinner:after {
  animation-delay: -0.8s;
}
@keyframes bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
