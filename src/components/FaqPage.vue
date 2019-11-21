<template>
  <div id="faq-items" class="container py-5">
    <b-row class="justify-content-md-center">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="mb-4">{{faq.title}}</h1>
        <div v-for="(group, i) in faq.groups" class="my-4">
          <h2>{{group.title}}</h2>
          <div v-for="(term, j) in group.faq" class="my-3">
            <a :id="`${term.id}`"></a>
            <div class="accordion-toggle" v-b-toggle="`accordion-${i}-${j}`">
              <strong>{{term.title}}</strong>
            </div>
            <div class="faq-item pb-1">
              <b-collapse
                v-bind:id="`accordion-${i}-${j}`"
                v-bind:visible="isOpen(term.id)"
                class="description py-2"
                accordion="my-accordion"
                role="tabpanel">
                <div class="summary my-1 p-3 bg-light border-left">{{term.summary}}</div>
                <p v-for="paragraph in term.description" v-html="paragraph" />
              </b-collapse>
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
  img {
    max-width: 100%;
  }
  .accordion-toggle {
    h4 {}
    cursor: n-resize;
    &.collapsed {
      cursor: s-resize;
      &::before {
        content: '+';
      }
    }
    &::before {
      content: '-';
      position: absolute;
      margin-left:-1em;
      font-size: 1.6em;
      line-height: 0.7;
      color: gray;
    }
  }
</style>
