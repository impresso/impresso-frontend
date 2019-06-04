<template lang="html">
  <i-layout id="EntitiesPage">
    <i-layout-section width="300px" class="border-right">
      <ul class="p-0">
        <li v-for="e in entities.entities" class="border-bottom list-unstyled m-0 p-3">
          <strong>{{ e.name }}</strong>
          <p>{{ e.wikidata.id }}</p>
        </li>
      </ul>
      <!-- {{entities}} -->
    </i-layout-section>
    <i-layout-section class="p-3">
      <b-card>
        <div class="float-right">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/DBP_1977_926_Jean_Monnet.jpg/300px-DBP_1977_926_Jean_Monnet.jpg" alt="DBP 1977 926 Jean Monnet">
        </div>
        <div class="small-caps">
          HUMAN
        </div>
        <h1>Jean Monnet</h1>
        <p>
          <a href="https://www.wikidata.org/wiki/Q285" target="_blank">Cognac</a>, {{ $d(new Date('1888-11-09T00:00:00Z'), 'year') }} -
          <a href="https://www.wikidata.org/wiki/Q83447" target="_blank">Bazoches-sur-Guyonne</a>
          , {{ $d(new Date('1979-03-16T00:00:00Z'), 'year') }}
        </p>
        <p>
          <strong>French political economist regarded by many as a chief architect of European unity</strong>
        </p>
        <p>
          <strong>6</strong> Occurrences (1902 - 1989), <br>
          <strong>7</strong> mentions within corpus.
        </p>
        <div class="float-right small small-caps">
          <a href="https://www.wikidata.org/wiki/Q159700">Source: WikiData</a>
        </div>
      </b-card>
    </i-layout-section>
  </i-layout>
</template>

<script>
import Pagination from './modules/Pagination';

export default {
  methods: {
    loadList(page) {
      if (page !== undefined) {
        this.$store.commit('entities/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      return this.$store.dispatch('entities/LOAD_ENTITIES');
    },
    onInputPaginationList(page = 1) {
      this.loadList(page);
    },
  },
  mounted() {
    this.loadList().then((res) => {
      console.log(res);
    });
  },
  computed: {
    entities() {
      return this.$store.state.entities;
    },
  },
  components: {
    Pagination,
  },
};
</script>

<style lang="scss">
</style>
