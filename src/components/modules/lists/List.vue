<template lang="html">
  <i-layout-section :width="width">
    <!-- <div slot="header" class="border-bottom border-tertiary bg-light"> -->
    <template v-slot:header>
      <!-- header -->
      <div class="border-bottom">
        <slot name="header"></slot>
      </div>
    </template>
    <!-- </div> -->
    <div class="items" :class="{ 'with-pagination': !hidePagination }">
      <!-- main loop -->
      <slot></slot>
    </div>
    <!-- pagination! -->
    <template v-slot:footer>
      <div class="fixed-pagination-footer p-1 m-0 mb-2" v-if="!hidePagination">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps"
        />
      </div>
    </template>
  </i-layout-section>
</template>

<script>
import Pagination from '../Pagination.vue'

export default {
  props: {
    hidePagination: Boolean,
    width: {
      type: String,
      default: '400px'
    },
    items: {
      type: Array
    },
    paginationList: {
      type: Object,
      default: () => ({
        perPage: 10,
        currentPage: 1,
        totalRows: 0
      })
    }
  },
  methods: {
    onInputPagination(page) {
      this.$emit('change-page', page)
    }
  },
  components: {
    Pagination
  }
}
</script>

<style lang="scss">
.items {
  &.with-pagination {
    padding-bottom: 35px;
  }
  .item.active {
    background: white;
    -webkit-box-shadow:
      inset 3px 0px #343a40,
      inset 0px 1px 0px #343a4063;
    box-shadow:
      inset 3px 0px #343a40,
      inset 0px 1px 0px #343a4063;
  }
}
</style>
