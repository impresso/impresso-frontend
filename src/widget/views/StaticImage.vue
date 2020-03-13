<template lang="html">
  <div class="h-100 v-100" :style="getBackgroundStyle">
    <div class="image h-100 v-100" :style="getImageStyle"></div>
    <div class="position-fixed footer p-3">{{ pageUid }}, {{coords}}</div>
  </div>
</template>

<script>
import { pages } from '@/services';

const DefaultCoords = '0,0,200,200';

const options = {
  backgroundColor: {
    default: 'transparent',
    validate: (d) => /^#\d{2,6}|black|white|grey$/.test(d),
  },
  backgroundSize: {
    default: 'normal',
    validate: (d) => ['contain', 'normal', 'cover'].indexOf(d) !== -1,
  },
};
// https://impresso-project.ch/api/proxy/iiif/EXP-1958-03-15-a-p0020/90,1844,408,515/full/0/default.png
export default {
  data: () => ({
    imageURL: null,
  }),
  props: {
    backgroundSize: String,
    backgroundColor: String,
  },
  methods: {
    validateOrIgnore(prop) {
      if (options[prop].validate(this[prop])) {
        return this[prop];
      }
      console.warn('validateOrIgnore() value for:', prop,'is not valid:', this[prop]);
      return options[prop].default;
    },
  },
  mounted() {
    console.info('@mounted', this.link);
    pages.get(this.pageUid).then(({ iiif, accessRights }) => {
      this.imageURL = `${iiif}/${this.coords}/full/0/default.jpg`;
      console.info('accessRights', accessRights, this.imageURL);
    });
  },
  computed: {
    pageUid() {
      const { pageUid } = this.$route.params;
      if (!/^[A-Za-z]+-\d{4}-\d{2}-\d{2}-[a-z]-p\d{4}$/.test(pageUid)) {
        console.warn('pageUid() not valid:', pageUid, 'returning index.');
        return '';
      }
      return pageUid;
    },
    coords() {
      const { coords } = this.$route.params;
      if (!/^\d{1,5},\d{1,5},\d{1,4},\d{1,4}$/.test(coords)) {
        console.warn('coords() not valid:', coords, 'returning default:', DefaultCoords);
        return DefaultCoords;
      }
      return coords;
    },
    getBackgroundStyle() {
      return {
        backgroundColor: this.validateOrIgnore('backgroundColor'),
      };
    },
    getImageStyle() {
      if (this.imageURL) {
        return {
          backgroundSize: this.validateOrIgnore('backgroundSize'),
          backgroundImage: `url(${this.imageURL})`,
          // https://live.staticflickr.com/7821/32349026587_077df84709_w_d.jpg)',
        };
      }
      return {}
    },
  },
};
</script>

<style lang="scss" scoped>
  .image{
    background-repeat: no-repeat;
    background-position: center;
  }
  .footer{
    bottom: 0;
    padding: 2rem;
    background-color: gold;
  }
</style>
