<template lang="html">
  <main id="TestPage">
      <h1>Playground for whatever</h1>
      <ul>
        <li v-for="(element, key) in elements">{{element.name}}
        <collection-tagger v-model="elements[key]" v-bind:collections="collections"></collection-tagger>
        </li>
      </ul>
  </main>
</template>

<script>
import CollectionTagger from './CollectionTagger';

export default {
  data: () => ({
    elements: [{
      name: 'test element 1',
      uid: 'dtuhg33',
      collections: [
        'id1',
        'id3',
      ],
    }, {
      name: 'test element 2',
      uid: 'asadqd',
      collections: [
        'id2',
        'id3',
      ],
    }, {
      name: 'test element 3',
      uid: '34sdf',
      collections: [],
    }],
    collections: [{
      name: 'id1',
      uid: 'id1',
    }, {
      name: 'id2',
      uid: 'id2',
    }, {
      name: 'id3',
      uid: 'id3',
    }],
  }),
  components: {
    CollectionTagger,
  },
};
</script>

<style scoped lang="less">
</style>
