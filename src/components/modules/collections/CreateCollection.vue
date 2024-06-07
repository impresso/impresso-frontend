<template>
    <Modal
      :show="show"
      :id="id"
      :title="title"
      class="rounded"
      no-fade
      hide-backdrop
      modal-class="CreateCollection"
      dialog-class="drop-shadow rounded">
    <div class="mt-3">
      <p>
        {{ $t('describeCollectionLimits') }}
        <InfoButton :name="infoButtonId" />
      </p>
    </div>
    <form v-on:submit="submitHandler">
      <label for="inputName">{{ $t('Collection_Name') }}</label>
      <p class="text-danger" v-if="inputNameError.length" v-html="inputNameError" />
      <b-form-input
        :class="{
          'is-invalid': inputNameError.length,
        }"
        type="text"
        aria-required="true"
        required
        v-bind:placeholder="$t('Collection_Name')"
        name="inputName"
        ref="inputName"
        v-model.trim="inputName"
      />
      <label for="inputDescription" class="mt-3">Description</label>
      <textarea
        type="text"
        name="inputDescription"
        class="form-control"
        v-model.trim="inputDescription"
      />
    </form>

    <template v-slot:modal-footer>
      <b-button
        size="sm"
        class="shadow-sm rounded"
        variant="outline-secondary"
        @click="() => $emit('close')"
      >
        {{ $t('actions.cancel') }}
      </b-button>
      <b-button
        size="sm"
        class="shadow-sm rounded"
        variant="outline-primary"
        @click="e => submitHandler(e)"
      >
        {{ $t('actions.create') }}
      </b-button>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/base/Modal.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import { collections } from '@/services'

export default {
  name: 'CreateCollection',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    filters: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // description name used to generate the id
    name: {
      type: String,
      required: false,
    },
    index: {
      type: String,
      default: 'search',
    },
    id: {
      type: String,
      required: true,
    },
    infoButtonId: {
      type: String,
      default: 'why-collections-are-limited',
    },
  },
  data() {
    return {
      inputName: '',
      inputDescription: '',
      inputNameError: '',
      inputDescriptionError: '',
      errorByInputField: {},
      formValidated: false,
    }
  },
  emits: ['collection:created', 'close'],
  computed: {
    metadata() {
      return [String(this.name).trim(), String(this.description).replace(/(<([^>]+)>)/gi, '')]
    },
  },
  methods: {
    submitHandler(e) {
      e.preventDefault()
      // eslint-disable-next-line no-console
      console.debug('[CreateCollection] @submitHandler', this.inputName)
      this.formValidated = true
      // check thqt the name is not empty
      if (this.inputName.trim() === '') {
        this.inputNameError = this.$t('CollectionNameRequired')
        return
      }
      collections
        .create(
          { name: this.inputName, description: this.inputDescription },
          { ignoreErrors: true },
        )
        .then(res => {
          console.debug('[CreateCollection] @submitHandler, collection.create OK', res)
          this.$emit('collection:created', res)
        })
        .catch(({ message, code, name }) => {
          console.debug('[CreateCollection] @submitHandler, collection.create ERROR', {
            message,
            code,
            name,
          })
          if (code === 409) {
            this.inputNameError = this.$t('CollectionNameExists')
          }
        })
    },
  },
  watch: {
    metadata: {
      handler([name, description]) {
        this.inputDescription = description
        this.inputName = name
      },
      immediate: true,
    },
  },
  components: { InfoButton, Modal },
}
</script>
<style lang="scss">
.CreateCollection {
  .modal-content {
    border-radius: 2px;
    box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.5);
  }
  .modal-header {
    border-bottom: 0;
  }
  h2 {
    font-size: 1.5rem;
    font-weight: 500;
  }
}
</style>
<i18n lang="json">
  {
    "en": {
      "Collection_Name": "Collection Name",
      "describeCollectionLimits": "Please note: Collections are currently limited to 10.000 items.",
      "describeCollectionLimitsMore": "If your search returned more results, only the 10.000 most relevant items will be stored. If you need to create a collection with more items, please contact us.",
      "actions": {
        "cancel": "Cancel",
        "create": "Create"
      },
      "CollectionNameRequired": "Please enter a name for your collection.",
      "CollectionNameExists": "A collection with this name already exists."
    }
  }
</i18n>
