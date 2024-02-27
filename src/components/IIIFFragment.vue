<template>
  <figure @click="e => $emit('click', e)" class="position-relative IIIFFragment">
    <img class="shadow-sm" :src="imageUrl" alt="IIIF Fragment" />
    <div class="IIIFFragment__regions" :style="computedRegionsStyle">
      <div
        v-for="region in computedRegions"
        :key="region.id"
        class="IIIFFragment__region position-absolute"
        :style="{
          top: `${region.y}%`,
          left: `${region.x}%`,
          width: `${region.w}%`,
          height: `${region.h}%`,
        }"
      ></div>
    </div>
  </figure>
</template>
<script>
import axios from 'axios'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IIIFFragment',
  data() {
    return {
      width: 0,
      height: 0,
      imageWidth: 0,
      imageHeight: 0,
      image: null,
      isLoaded: false,
    }
  },
  props: {
    iiif: {
      // IIIF root URL
      type: String,
      required: true,
    },
    size: {
      // IIIF size parameter
      type: String,
      default: 'max',
    },
    coords: {
      // IIIF size parameter
      type: Object,
    },
    regions: {
      type: Array,
      default: () => [],
    },
    matches: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    imageUrl() {
      // remove inof.json from IIIF if any
      const iiif = this.iiif.replace('/info.json', '')
      let url = ''
      if (this.coords) {
        // /125,15,120,140/max/0/default.jpg
        const { x, y, w, h } = this.coords

        return `${iiif}/${x},${y},${w},${h}/${this.size}/0/default.jpg`
      }
      return `${iiif}/full/${this.size}/0/default.jpg`
    },
    computedRegionsStyle() {
      return {
        width: `${this.imageWidth}px`,
        height: `${this.imageHeight}px`,
        opacity: this.isLoaded ? 1 : 0,
      }
    },
    computedRegions() {
      if (!this.isLoaded) return []
      return this.regions.map((region, id) => {
        const { x, y, w, h } = region.coords
        return {
          id,
          x: (x / this.width) * 100,
          y: (y / this.height) * 100,
          w: (w / this.width) * 100,
          h: (h / this.height) * 100,
        }
      })
    },
  },
  mounted() {
    const iiif = this.iiif.replace('/info.json', '')
    console.info('[IIIFFragment]', this.imageUrl, this.matches)
    axios
      .get(`${iiif}/info.json`)
      .then(response => {
        this.width = response.data.width
        this.height = response.data.height
        this.image = new Image()
        // get actual size fo the image
        this.image.onload = () => {
          console.info('image loaded')
          this.imageWidth = this.image.naturalWidth
          this.imageHeight = this.image.naturalHeight
          this.isLoaded = true
        }
        this.image.src = this.imageUrl
      })
      .catch(error => {
        console.error(error)
      })
    // load iiiif info.json
  },
})
</script>
<style type="text/css">
.IIIFFragment img {
  border: 1px solid #8e8e8e !important;
}
.IIIFFragment__regions {
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.2s ease-in-out;
  z-index: 1;
}
.IIIFFragment__region {
  position: absolute;
  border: 1px solid var(--dark) !important;
  background-color: var(--clr-grey-400-rgba-20);
  z-index: 2;
}
</style>
