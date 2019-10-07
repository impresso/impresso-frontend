<template lang="html">
  <div :class="status">
    <b-modal v-on:hidden="onHidden" id="facet-explorer-modal" ref="facet-explorer-modal">
      <template v-slot:modal-header class="mt-2 mr-0">
        <div>
          <div class="tb-title small-caps font-weight-bold">{{ $t('explore') }}</div>
          <div class="small mb-1">
            <span v-if="isLoading">{{ $t('loading') }}</span>
            <span v-else v-html="$tc(`description.${mode}`, countBuckets, {
              q,
            })"></span>
          </div>
          <b-button v-for="(availableType, i) in typeOptions" v-bind:key="i" class="mr-1 mt-1"
            variant="outline-primary" size="sm"
            v-on:click="onChangeType(availableType)"
            v-bind:class="{ 'active' :
              type === availableType
            }">
            {{availableType}}
          </b-button>
          <div>
            <form v-if="mode === 'search'" v-on:submit.prevent="onSearch" class="mt-2">
              <b-input-group>
                <b-form-input
                :placeholder="$tc('searchField.placeholder', countBuckets)"
                v-model.trim="q"
                autofocus
                />
                <b-input-group-append>
                  <b-btn class="pt-2 pb-1 px-2"
                    variant="outline-primary"
                    v-on:click="onSearch">
                    <div class="search-submit dripicons-search"></div>
                  </b-btn>
                </b-input-group-append>
              </b-input-group>
            </form>
          </div>
        </div>
      </template>
      <facet-explorer
        :initial-type="type"
        :q="q"
        v-on:submit-buckets="onSubmitBuckets" />
      <template v-slot:modal-footer>
        <b-button variant="outline-primary" size="sm" block v-on:click="onHide">Close Me</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import FacetExplorer from './modules/FacetExplorer';

export default {
  methods: {
    onSubmitBuckets(buckets) {
      console.info('explorer @onSubmitBuckets', buckets);
    },
    onHide() {
      this.$bvModal.hide('facet-explorer-modal');
    },
    onHidden() {
      this.$store.dispatch('explorer/HIDE');
    },
    onChangeType(type) {
      this.$store.dispatch('explorer/SHOW', { type });
      this.$store.dispatch('buckets/SEARCH_BUCKETS', { type });
    },
    onSearch() {
      // if (this.q.length) {
      //   this.$store.dispatch('buckets/CHANGE_Q', this.q);
      // } else {
      //   this.$store.dispatch('buckets/CHANGE_PAGE', 1);
      // }
      // this.$store.dispatch('buckets/LOAD_BUCKETS');
    },
  },
  computed: {
    countBuckets() {
      return this.$store.state.buckets.pagination.totalRows;
    },
    isLoading() {
      return this.$store.state.buckets.isLoading;
    },
    isSearchable() {
      return this.mode === 'search';
    },
    mode() {
      return this.$store.state.explorer.mode;
    },
    q: {
      get() {
        return this.$store.state.explorer.q;
      },
      set(q) {
        this.$store.dispatch('explorer/SHOW', { q });
        this.$store.dispatch('buckets/SEARCH_BUCKETS', { q });
      },
    },
    status() {
      return this.$store.state.explorer.status;
    },
    type() {
      return this.$store.state.explorer.type;
    },
    typeOptions() {
      if (this.isSearchable) {
        return ['newspaper', 'person', 'location', 'topic', 'collection'];
      }
      return this.$store.state.buckets.typeOptions;
    },
  },
  components: {
    FacetExplorer,
  },
  watch: {
    status: {
      handler(val) {
        if (val === 'on') {
          this.$bvModal.show('facet-explorer-modal');
        }
      },
    },
  },
};
</script>

<style lang="css" scoped>
</style>

<i18n>
  {
    "en": {
      "description": {
        "search": "It looks like there are <b>no available options</b> matching for type: | ... Just <b>one</b> option mathing for type:| Select among<b> {count}</b> options matching {q} for type:",
        "facets": "It looks like there are <b>no available options</b> using current search for type: | ... Just <b>one</b> option to refine your search for type:| Select among<b> {count}</b> options to refine your search for type:"
      },
      "searchField": {
        "placeholder": "...|There is only one choice...|Search one of {n} available choices",
        "notAvailable": "...|There is only one choice:|Pick one of the <span class='number'>{n}</span> available choiches:"
      }
    }
  }
</i18n>
