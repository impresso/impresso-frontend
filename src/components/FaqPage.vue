<template>
  <div id="faq-items" class="container py-5">
    <b-row class="justify-content-md-center mb-5">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="text-center mb-5">{{faq.title}}</h1>
        <div v-for="(term, i) in faq.faq" class="mb-5">
          <a :id="`${term.id}`"></a>
          <div class="accordion-toggle" v-b-toggle="`accordion-${i}`">
            <h4>{{term.title}}</h4>
            <div class="summary my-1 d-block">{{term.summary}}
              <div class="text-right small-caps">
                {{$t("more_info")}} &darr;
              </div>
            </div>
          </div>
          <div class="faq-item pb-1">
            <b-collapse class="description py-2" v-bind:id="`accordion-${i}`" accordion="my-accordion" role="tabpanel">
              <p v-for="paragraph in term.description" v-html="paragraph" />
            </b-collapse>
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
  img {
    max-width: 100%;
  }
  .accordion-toggle {
    h4 {}
    cursor: n-resize;
    &.collapsed {
      cursor: s-resize;
    }
    .summary {
      background: #eee;
      padding: 0.1em 0.4em;
      font-style: normal;
    }
  }
</style>
