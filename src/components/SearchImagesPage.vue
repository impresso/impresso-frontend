<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right border-tertiary">
      <div slot="header" class="border-bottom border-tertiary bg-light">
          <b-tabs pills class="border-bottom border-tertiary">
            <template slot="tabs">
              <b-nav-item :to="{ name:'search'}"  ><span v-html="$t('tabs.text')"/></b-nav-item>
              <b-nav-item :to="{ name:'searchImages'}" exact><span v-html="$t('tabs.images')"/></b-nav-item>
            </template>
          </b-tabs>
          <div class="py-3 px-3">
          </div>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
export default {
};
</script>

<style lang="scss">
</style>
