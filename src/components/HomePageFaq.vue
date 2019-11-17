<template lang="html">
  <div id="faq-items" class="container py-5">
    <b-row class="justify-content-md-center mb-5">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="mb-5">{{faq.title}}</h1>


        <div v-for="(group, i) in faq.groups" class="mb-5">
          <h3>{{group.title}}</h3>
          <div
            v-for="(question, j) in group.questions"
            v-bind:key="`${i}-${j}`"
            class="faq-item pb-1">
            <div class="question">
              <strong><a href="#" v-b-toggle="`accordion-${i}-${j}`" class="my-1 d-block">{{question.question}}</a></strong>
            </div>
            <b-collapse class="answer" v-bind:id="`accordion-${i}-${j}`" accordion="my-accordion" role="tabpanel">
              <div class="p-4 bg-light" v-html="question.answer" />
            </b-collapse>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import content from '@/assets/homepage.json';

export default {
  data: () => ({
    faq: content.faq,
  }),
};
</script>

<style lang="scss" scoped>
</style>
