<template>
  <Modal
    :show="isShown"
    scrollable centered ok-only no-close-on-backdrop hideHeaderClose
    id="disclaimerNotice"
    :title="content.title">
    <template v-slot:modal-footer>
      <b-button variant="primary" size="sm" @click="agreeTerms()">{{ $t('actions.agree') }}</b-button>
    </template>
    <div style="max-height:50vh; overflow:scroll"><p
      v-for="(para, i) in content.body"
      v-bind:key="i"
      v-html="para" />
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/base/Modal.vue'
import content from '@/assets/disclaimer.json';

export default {
  data: () => ({
    isShown: false,
  }),
  mounted() {
    this.isShown = true;
  },
  methods: {
    agreeTerms() {
      this.$store.dispatch('settings/ACCEPT_TERMS_OF_USE');
    },
  },
  computed: {
    content: {
      get() {
        return content[this.activeLanguageCode];
      },
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
  },
  components: {
    Modal,
  }
};
</script>
