<template>
  <Modal
    :show="isVisible"
    :title="modalTitle ?? title"
    modalClasses="PlansModal"
    :dialogClass="props.dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @close="dismiss"
  >
    <h1>{{ title }}</h1>

    <div class="container">
      <div class="row my-3">
        <MarkdownContent :url="isVisible ? url : undefined" />
      </div>
      <div class="row position-sticky top-0 bg-light">
        <div class="col-lg-2"></div>
        <div class="col py-3 d-flex align-items-end" v-for="plan in Content.Plans" :key="plan.id">
          <h2 className="m-0 font-size-inherit  font-weight-bold">
            {{ plan.title }}
            <div
              v-if="userPlan === plan.id"
              className="badge d-block small-caps mt-2 shadow-sm bg-primary text-white"
            >
              current plan
            </div>
          </h2>
        </div>
      </div>
      userPlan: {{ userPlan }}
      {{ Content }}
    </div>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './base/Modal.vue'
import MarkdownContent from './MarkdownContent.vue'
import Content from '@/assets/plans.json'

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    modalTitle?: string
    title?: string
    url?: string
    acceptTermsDate?: Date
    isVisible?: boolean
    userPlan: string
    userPlanLabel: string
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-xl',
    title: 'Terms Of Use',
    url: import.meta.env.VITE_PLANS_MD_URL
  }
)

const emit = defineEmits(['dismiss'])

const dismiss = () => {
  console.debug('[TermsOfUseModal] dismiss')
  emit('dismiss')
}
</script>

<style>
.PlansModal {
  z-index: 1002;
}
.PlansModal h2,
.PlansModal h3 {
  font-size: inherit;
}
/* .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
} */

/* button {
  margin: 5px;
} */
</style>
