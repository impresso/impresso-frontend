<template lang="html">
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom pt-2 pb-2">
      <section class="d-flex w-100">
        <div class="mr-auto align-self-center">
          <h3 class='mb-1'>{{entity.wikidata.labels[activeLanguageCode]}}</h3>
          <span class="label small-caps"><strong>{{entity.wikidata.type}}</strong>
             - mentioned <strong>2393203</strong> times in
             <strong>1342</strong> articles in impresso</span>
        </div>
        <div class="align-self-center">
          <b-dropdown v-bind:text="$t('Export ...')" size="sm" variant="outline-primary" class="bg-white">
            <b-dropdown-item>
              <span class="dripicons-archive pr-3"></span>
              Whatever
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </section>
    </b-navbar>
    <div class="p-3 border-bottom d-flex w-100">
      <h1 class="align-self-center p-0 m-0 pr-3 text-tertiary">
        W
      </h1>
      <div class=" align-self-center">
          <strong>{{entity.wikidata.labels[activeLanguageCode]}}</strong>
          <span v-if="entity.wikidata.type === 'human'">
            ({{$d(new Date(entity.wikidata.birthDate.slice(1)), 'compact')}} –
            {{$d(new Date(entity.wikidata.deathDate.slice(1)), 'compact')}})
            <br>
            Born in
            <a :href="`https://maps.google.com/?q=${entity.wikidata.birthPlace.coordinates.latitude},${entity.wikidata.birthPlace.coordinates.longitude}`"
              target="_blank">
              {{entity.wikidata.birthPlace.labels[activeLanguageCode]}},
              {{entity.wikidata.birthPlace.descriptions[activeLanguageCode]}}
            </a>
            <br>
            Died in
            <a :href="`https://maps.google.com/?q=${entity.wikidata.deathPlace.coordinates.latitude},${entity.wikidata.deathPlace.coordinates.longitude}`"
              target="_blank">
              {{entity.wikidata.deathPlace.labels[activeLanguageCode]}},
              {{entity.wikidata.deathPlace.descriptions[activeLanguageCode]}}
            </a>
          </span>
          <br>
          {{entity.wikidata.descriptions[activeLanguageCode]}}
      </div>
    </div>
  </i-layout-section>
</template>

<script>
export default {
  data: () => ({
    tab: {},
    info: null,
    entity: {
      id: 1,
      name: 'null',
      type: 'entity',
      wikidataId: 'Q159700',
      dbpediaURL: null,
      impressoId: null,
      wikidata: {
        id: 'Q159700',
        type: 'human',
        labels: {
          fr: 'Jean Monnet',
          it: 'Jean Monnet',
          de: 'Jean Monnet',
          en: 'Jean Monnet',
        },
        descriptions: {
          it: 'politico francese',
          fr: 'homme politique français',
          de: 'französischer Staatsmann und Politiker',
          en: 'French political economist regarded by many as a chief architect of European unity',
        },
        birthDate: '+1888-11-09T00:00:00Z',
        deathDate: '+1979-03-16T00:00:00Z',
        birthPlace: {
          id: 'Q285',
          type: 'location',
          labels: {
            fr: 'Cognac',
            en: 'Cognac',
            de: 'Cognac',
            it: 'Cognac',
          },
          descriptions: {
            fr: 'commune française du département de la Charente',
            de: 'französische Stadt im Département Charente',
            it: 'comune francese',
            en: 'commune in Charente, France',
          },
          coordinates: {
            latitude: 45.695833333333,
            longitude: -0.32916666666667,
            altitude: null,
            precision: 0.00027777777777778,
            globe: 'http://www.wikidata.org/entity/Q2',
          },
          country: {
            'entity-type': 'item',
            'numeric-id': 142,
            id: 'Q142',
          },
        },
        deathPlace: {
          id: 'Q83447',
          type: 'location',
          labels: {
            fr: 'Bazoches-sur-Guyonne',
            en: 'Bazoches-sur-Guyonne',
            it: 'Bazoches-sur-Guyonne',
            de: 'Bazoches-sur-Guyonne',
          },
          descriptions: {
            fr: 'commune française du département des Yvelines',
            it: 'comune francese',
            en: 'commune in Yvelines, France',
            de: 'französische Gemeinde',
          },
          coordinates: {
            latitude: 48.778333333333,
            longitude: 1.8602777777778,
            altitude: null,
            precision: 0.00027777777777778,
            globe: 'http://www.wikidata.org/entity/Q2',
          },
          country: {
            'entity-type': 'item',
            'numeric-id': 142,
            id: 'Q142',
          },
        },
      },
    },
  }),
  methods: {
    getImage() {
      fetch(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${this.entity.wikidataId}&property=P18`, { crossdomain: true })
        .then((response) => { console.log(response); this.info = response; });
    },
  },
  computed: {
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
  },
};
</script>
