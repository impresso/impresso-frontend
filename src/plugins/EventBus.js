// Global Eventbus

/*
// Usage outside Vue
import EventBus from '@/EventBus';

EventBus.$emit('testOutside', {
  msg: 'test from outside vue',
});

EventBus.$on('testOutside', (data) => {
  console.log(data.msg); // test from outside vue
});

EventBus.$on('testInside', (data) => {
  console.log(data.msg); // test from inside vue
});

*/

/*
// Usage inside Vue component
...
methods: {
  myMethods() {
    this.$eventBus.$emit('testInside', {
      msg: 'test from inside vue',
    });
  },
  mounted() {
    this.$eventBus.$on('testOutside', (data) => {
      console.log(data.msg); // test from outside vue
    });

    this.$eventBus.$on('testInside', (data) => {
      console.log(data.msg); // test from inside vue
    });
  },
},
...
*/

import EventBus from '../EventBus';

export default {
  install(Vue) {
    Vue.prototype.$eventBus = EventBus;
  },
};
