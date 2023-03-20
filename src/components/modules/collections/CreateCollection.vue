<template
  ><b-modal
    :id="id"
    :title="title"
    class="rounded"
    no-fade
    hide-backdrop
    modal-class="CreateCollection"
    dialog-class="drop-shadow rounded"
    o
  >
    <form v-on:submit="submitHandler">
      <label for="inputName">{{ $t('Collection_Name') }}</label>
      <p v-if="errorByInputField.inputName" v-html="errorByInputField.inputName" />
      <b-form-input
        type="text"
        aria-required="true"
        required
        v-bind:placeholder="$t('Collection_Name')"
        name="inputName"
        ref="inputName"
        v-model="inputName"
      />
      <label for="inputDescription" class="mt-3">Description</label>
      <textarea
        type="text"
        name="inputDescription"
        class="form-control"
        v-model="inputDescription"
      />
    </form>
    <div class="mt-3 small-caps">
      <p>{{ $t('describeCollectionLimits') }}</p>
      <p class="mb-0">
        {{ $t('describeCollectionLimitsMore') }}
      </p>
    </div>
    <template slot="modal-footer">
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
  </b-modal>
</template>

<script>
export default {
  name: 'CreateCollection',
  props: {
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
    index: {
      type: String,
      default: 'search',
    },
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      inputName: '',
      inputDescription: this.description,
      errorByInputField: {},
    }
  },
  emits: ['create', 'close'],
  methods: {
    submitHandler(e) {
      e.preventDefault()
      // eslint-disable-next-line no-console
      console.debug('[CreateCollection] @submitHandler', this.inputName)
      this.errorByInputField = {}
      // check thqt the name is not empty
      if (this.inputName === '') {
        this.errorByInputField.inputName = this.$t('CollectionNameRequired')
        return
      }

      this.$emit('create', this.inputName, this.inputDescription)
    },
  },
  watch: {
    description(v) {
      this.inputDescription = v.replace(/(<([^>]+)>)/gi, '')
    },
  },
}
</script>
<style lang="scss">
.CreateCollection {
  .modal-content {
    border-radius: 3px;
    box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.1);
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
<i18n>
  {
    "en": {
      "Collection_Name": "Collection Name",
      "describeCollectionLimits": "Please note: Collections are currently limited to 10.000 items.",
      "describeCollectionLimitsMore": "If your search returned more results, only the 10.000 most relevant items will be stored. If you need to create a collection with more items, please contact us.",
      "actions": {
        "cancel": "Cancel",
        "create": "Create"
      },
      "CollectionNameRequired": "Please enter a name for your collection."
    }
  }
</i18n>
