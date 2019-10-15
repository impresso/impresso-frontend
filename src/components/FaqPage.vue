<template>
  <div id="faq-items" class="container py-5">
    <b-row class="justify-content-md-center mb-5">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="text-center mb-5">{{faq.title}}</h1>
        <div v-for="(term, i) in faq.faq" class="mb-5">
          <a :id="`${term.id}`"></a>
          <h3>{{term.title}}</h3>
          <div class="faq-item pb-1">
            <div class="summary">
              <strong class="my-1 d-block">{{term.summary}}</strong>
            </div>
            <div class="description py-2">
              <p v-for="paragraph in term.description" v-html="paragraph" />
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>

</template>

<script>
import content from '@/assets/faqpage.json';

export default {
  computed: {
    faq: {
      get() {
        return content[this.activeLanguageCode];
      },
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
  },
};
</script>

<style lang="scss">
</style>
