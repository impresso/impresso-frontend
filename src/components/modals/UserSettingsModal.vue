<template>
  <InfoModal
    :isVisible="isVisible"
    :title="$t('userSettings')"
    @dismiss="emit('dismiss')"
    dialogClass="modal-md modal-dialog-centered"
  >
    <div class="container-fluid">
      <div class="row border-bottom py-2">
        <div class="col-5 pl-2">
          {{ $t('userPlanLabel') }}
        </div>
        <div class="col-7 pr-2">
          <b>{{ props.userPlanLabel }}</b>
          ({{ props.userPlan }})
        </div>
      </div>

      <div class="row border-bottom py-2">
        <div class="col-5 pl-2">
          {{ $t('userBitmapLabel') }}
        </div>
        <div class="col-7 pr-2" style="word-break: break-all; white-space: pre-wrap">
          {{ props.userBitmapBase64 }}
        </div>
      </div>
      <div class="row border-bottom py-2">
        <div class="col-5 pl-2">
          {{ $t('userBitmapBitstringLabel') }}
        </div>
        <div class="col-7 pr-2" style="word-break: break-all; white-space: pre-wrap">
          {{ bitmapAsBitstring }}
        </div>
      </div>
      <div class="row border-bottom py-2">
        <div class="col-5 pl-2">
          {{ $t('userAcceptTermsDateLocalLabel') }}
        </div>
        <div class="col-7 pr-2" v-if="props.acceptTermsDateOnLocalStorage">
          {{ $d(new Date(props.acceptTermsDateOnLocalStorage), 'precise') }}
        </div>
        <div class="col-7 pr-2" v-else>
          {{ $t('notAcceptedLocalLabel') }}
        </div>
      </div>
      <div class="row border-bottom py-2">
        <div class="col-5 pl-2">
          {{ $t('userAcceptTermsDateOnDbLabel') }}
        </div>
        <div class="col-7 pr-2" v-if="props.acceptTermsDate">
          {{ $d(new Date(props.acceptTermsDate), 'precise') }}
        </div>
        <div class="col-7 pr-2" v-else>
          {{ $t('notAcceptedOnDbLabel') }}
        </div>
      </div>
    </div>
    <Alert class="p-2 mt-3 border border-info">
      <TermsOfUseStatus withCallToAction />
    </Alert>
  </InfoModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InfoModal from '../InfoModal.vue'
import TermsOfUseStatus from '../TermsOfUseStatus.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'

interface UserSettingsProps {
  isVisible: boolean
  userPlan: string
  userPlanLabel: string
  acceptTermsDate: string | null
  acceptTermsDateOnLocalStorage: string | null
  userBitmapBase64: string
}

const props = withDefaults(defineProps<UserSettingsProps>(), {
  isVisible: false,
  userPlan: '',
  userPlanLabel: '',
  acceptTermsDate: null,
  acceptTermsDateOnLocalStorage: null,
  userBitmapBase64: ''
})

const emit = defineEmits<{
  dismiss: []
}>()

const bitmapAsBitstring = computed(() => {
  if (!props.userBitmapBase64) {
    return ''
  }
  try {
    const binaryString = atob(props.userBitmapBase64)
    let bitstring = ''
    for (let i = 0; i < binaryString.length; i++) {
      const byte = binaryString.charCodeAt(i)
      bitstring += byte.toString(2).padStart(8, '0')
    }
    return bitstring
  } catch (e) {
    return ''
  }
})
</script>
<i18n lang="json">
{
  "en": {
    "userSettings": "User settings",
    "userPlanLabel": "Current plan:",
    "userBitmapLabel": "User bitmap (base64):",
    "userBitmapBitstringLabel": "User bitmap (bitstring):",
    "userAcceptTermsDateLocalLabel": "Terms of Use accepted on (local):",
    "userAcceptTermsDateOnDbLabel": "Terms of Use accepted on (database):",
    "notAcceptedLocalLabel": "Not accepted (local)",
    "notAcceptedOnDbLabel": "Not accepted (database)"
  }
}
</i18n>
