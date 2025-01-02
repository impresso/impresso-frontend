<template>
  <div>
    <div
      v-if="isRendered"
      class="modal"
      :class="modalClasses"
      tabindex="-1"
      :aria-labelledby="`${id}-title`"
      aria-modal="true"
      role="dialog"
      style="display: block"
    >
      <div class="modal-dialog" :class="dialogClass">
        <div class="modal-content" :class="contentClass">
          <div class="modal-header d-flex align-items-center">
            <slot name="modal-header" v-bind:title-id="`${id}-title`" v-bind:close="() => close()">
              <h5 class="modal-title small-caps" :id="`${id}-title`">{{ props.title }}</h5>
              <button
                class="btn btn-transparent text-dark"
                v-if="!props.hideHeaderClose"
                type="button"
                aria-label="Close"
                @click="close"
              >
                <Icon name="cross" color />
              </button>
            </slot>
          </div>
          <div :class="`modal-body ${bodyClass ?? ''}`">
            <slot> </slot>
          </div>
          <div v-if="!props.hideFooter" class="modal-footer">
            <slot name="modal-footer" v-bind:close="() => close()">
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="close()">
                Close
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary"
                :class="{ disabled: props.okDisabled }"
                :disabled="props.okDisabled"
                @click="emit('ok')"
              >
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isVisible && !props.hideBackdrop" class="modal-backdrop"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { v4 } from 'uuid'
import Icon from './Icon.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  title: String,
  bodyClass: String,
  hideFooter: {
    type: Boolean,
    default: false
  },
  okDisabled: {
    type: Boolean,
    default: false
  },
  noFade: {
    type: Boolean,
    default: false
  },
  hideBackdrop: {
    type: Boolean,
    default: false
  },
  modalClass: String,
  dialogClass: String,
  contentClass: String,
  hideHeaderClose: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'ok', 'shown'])
const id = v4()
const isVisible = ref(props.show)
const isRendered = ref(props.show)

watch(
  () => props.show,
  show => {
    // show
    if (show && !isRendered.value) {
      isRendered.value = true
      setTimeout(() => {
        isVisible.value = true
      }, 100)
    }
    // hide
    if (!show && isVisible.value) {
      isVisible.value = false
    }
  }
)

watch(isVisible, visible => {
  if (!visible) {
    setTimeout(() => {
      isRendered.value = false
    }, 500)
  } else {
    emit('shown')
  }
})

const close = () => {
  isVisible.value = false
  emit('close')
}

const modalClasses = computed(() => ({
  show: isVisible.value,
  fade: !props.noFade,
  [props.modalClass as string]: !!props.modalClass
}))
</script>
<style>
.modal .btn svg path {
  stroke: black;
}

@media (min-width: 1024px) {
  .modal-lg,
  .modal-xl,
  .modal-xxl {
    --bs-modal-width: 1000px !important;
  }
}
</style>
