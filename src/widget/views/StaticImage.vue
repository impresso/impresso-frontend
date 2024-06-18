<template lang="html">
  <div :style="getBackgroundStyle">
    <div class="image" :style="getImageStyle"></div>
    <div class="caption">{{ pageUid }}, {{coords}}</div>
  </div>
</template>

<script>
import { pages } from '@/services';
import { DefaultCoords, validateOrIgnore } from '@/widget/logic/props';

// https://impresso-project.ch/api/proxy/iiif/EXP-1958-03-15-a-p0020/90,1844,408,515/full/0/default.png
export default {
  data: () => ({
    imageURL: null,
  }),
  props: {
    backgroundSize: String,
    backgroundColor: String,
    cssFilter: String,
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
        backgroundColor: validateOrIgnore(
          'backgroundColor',
          this.backgroundColor,
        ),
      };
    },
    getImageStyle() {
      if (!this.imageURL) {
        return {};
      }
      const style = {
        backgroundSize: validateOrIgnore(
          'backgroundSize',
          this.backgroundSize,
        ),
        backgroundImage: `url(${this.imageURL})`,
        // https://live.staticflickr.com/7821/32349026587_077df84709_w_d.jpg)',
      };
      const [filter, value] = validateOrIgnore(
        'cssFilter',
        this.cssFilter,
      );
      if (filter) {
        return {
          ...style,
          filter: `${filter}(${value})`,
        };
      }
      return style;
    },
  },
};
</script>
