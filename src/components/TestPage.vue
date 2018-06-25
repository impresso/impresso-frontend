<template lang="html">
  <main id="TestPage">
      <h1>Playground for whatever</h1>
      <ul>
        <li v-for="(element, key) in elements">{{element.name}}
        <collection-tagger v-model="elements[key]"></collection-tagger>
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
      collections: [],
    }, {
      name: 'test element 2',
      uid: 'asadqd',
      collections: [],
    }, {
      name: 'test element 3',
      uid: '34sdf',
      collections: [],
    }],
  }),
  components: {
    CollectionTagger,
  },
};
</script>

<style scoped lang="less">
</style>
