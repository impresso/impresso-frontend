<template lang="html">
  <div id="faq-items" class="container py-5">
    <b-row class="justify-content-md-center mb-5">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="text-center mb-5">FAQ</h1>
        <div
          v-for="i in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          v-bind:key="i"
          class="faq-item pb-1">
          <div class="question">
              <strong><a href="#" v-b-toggle="`accordion-${i}`" class="my-3 d-block">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</a></strong>
          </div>
          <b-collapse class="answer" v-bind:id="`accordion-${i}`" accordion="my-accordion" role="tabpanel">
            <div class="p-4 bg-light">
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
          </b-collapse>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  date: () => ({

  }),
};
</script>

<style lang="scss" scoped>
</style>
