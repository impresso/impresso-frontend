<template>
  <div class="IIIFFragment">
    <figure class="position-relative IIIFFragment overflow-hidden">
      <auth-img
        class="shadow-sm"
        :src="computedImageUrl"
        :alt="isNotFound ? 'Image not available' : ''"
        :style="{
          transform: `scale(${scale})`,
          'transform-origin': 'left top'
        }"
        :auth-condition="authCondition"
        @load="onImageLoad"
        @error="onImageLoadError"
      />
      <div
        class="IIIFFragment__regions"
        :style="computedRegionsStyle"
        @click="e => $emit('selected', e)"
      >
        <div
          v-for="region in computedRegions"
          :key="region.id"
          class="IIIFFragment__region position-absolute"
          :style="{
            top: `${region.y}%`,
            left: `${region.x}%`,
            width: `${region.w}%`,
            height: `${region.h}%`
          }"
        ></div>
      </div>
    </figure>
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import AuthImg from '@/components/AuthImg.vue'
import { getAuthenticationToken } from '@/services'
import { getAuthHeaders } from '@/util/auth'
import { defaultAuthCondition } from '@/util/imageAuth'
import axios from 'axios'
import { defineComponent, PropType } from 'vue'

interface ICoords {
  x: number
  y: number
  w: number
  h: number
}

export default defineComponent({
  name: 'IIIFFragment',
  data() {
    return {
      width: 0,
      height: 0,
      imageWidth: 0,
      imageHeight: 0,
      isLoaded: false,
      isNotFound: false,
      errorMessage: null
    }
  },
  props: {
    iiif: {
      // IIIF root URL
      type: String,
      required: true
    },
    fitToRegions: {
      // IIIF size parameter
      type: Boolean,
      default: false
    },
    size: {
      // IIIF size parameter
      type: String,
      default: 'max'
    },
    scale: {
      // scale down size parameter when printing image
      type: Number,
      default: 1
    },
    coords: {
      // IIIF size parameter
      type: Object
    },
    regions: {
      type: Array as PropType<{ coords: ICoords }[]>,
      default: () => []
    },
    matches: {
      type: Array,
      default: () => []
    },
    coordMinArea: {
      type: Number,
      default: 250 * 250
    },
    authCondition: {
      type: Function as PropType<(imageUrl: string) => boolean>,
      default: defaultAuthCondition
    }
  },
  computed: {
    computedImageUrl() {
      // remove inof.json from IIIF if any
      let iiif = this.iiif.replace('/info.json', '')
      if (this.regions.length && this.fitToRegions) {
        const coords = this.getCoordsFromArticleRegions()
        if (coords.w * coords.h < this.coordMinArea) {
          return `${iiif}/full/${this.size}/0/default.jpg`
        }
        return `${iiif}/${coords.x},${coords.y},${coords.w},${coords.h}/${this.size}/0/default.jpg`
      }
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
        transform: `scale(${this.scale})`,
        'transform-origin': 'left top'
      }
    },
    computedRegions() {
      if (!this.isLoaded) return []
      const offsets = this.fitToRegions ? this.getCoordsFromArticleRegions() : null
      return this.regions.map((region, id) => {
        const { x, y, w, h } = region.coords
        if (offsets) {
          return {
            id,
            x: ((x - offsets.x) / offsets.w) * 100,
            y: ((y - offsets.y) / offsets.h) * 100,
            w: (w / offsets.w) * 100,
            h: (h / offsets.h) * 100
          }
        }

        return {
          id,
          x: (x / this.width) * 100,
          y: (y / this.height) * 100,
          w: (w / this.width) * 100,
          h: (h / this.height) * 100
        }
      })
    }
  },
  methods: {
    onImageLoad(e: Event) {
      const target = e.target as HTMLImageElement
      this.imageWidth = target.naturalWidth
      this.imageHeight = target.naturalHeight
      this.isLoaded = true
    },
    onImageLoadError(e: Error) {
      this.isNotFound = e['status'] === 404
      this.isLoaded = false
      if (e['status'] !== 404) {
        this.errorMessage = e.message
      }
    },
    requiresAuth(url: string) {
      const authCondition = this.authCondition ?? defaultAuthCondition
      return authCondition(url)
    },
    getRequestHeaders(url: string) {
      const headers = this.requiresAuth(url) ? getAuthHeaders(getAuthenticationToken()) : {}
      return headers
    },
    getCoordsFromArticleRegions() {
      let x0 = Infinity
      let x1 = 0
      let y0 = Infinity
      let y1 = 0

      this.regions.forEach(d => {
        if (d.coords.x < x0) {
          x0 = d.coords.x
        }
        if (d.coords.y < y0) {
          y0 = d.coords.y
        }
        if (d.coords.x + d.coords.w > x1) {
          x1 = d.coords.x + d.coords.w
        }
        if (d.coords.y + d.coords.h > y1) {
          y1 = d.coords.y + d.coords.h
        }
      })
      return {
        x: x0,
        y: y0,
        w: x1 - x0,
        h: y1 - y0
      }
    },
    async getIIIFInfo() {
      const iiif = this.iiif.replace('/info.json', '')
      // .replace(String(import.meta.env.VITE_BASE_URL), '')

      try {
        const response = await axios.get(`${iiif}/info.json`, {
          headers: this.getRequestHeaders(iiif)
        })

        this.width = response.data.width
        this.height = response.data.height
      } catch (error) {
        if (error?.response?.status !== 404) {
          this.errorMessage = `${error.message}: ${iiif}`
        } else {
          this.isLoaded = false
          this.isNotFound = true
        }
      }
    }
  },
  components: {
    AuthImg
  },
  mounted() {
    this.getIIIFInfo()
    // load iiiif info.json
  }
})
</script>
<style type="text/css">
.IIIFFragment {
  cursor: auto;
}
.IIIFFragment img {
  border: 1px solid #8e8e8e !important;
}
.IIIFFragment__regions {
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.2s ease-in-out;
  z-index: 1;
  cursor: pointer;
}
.IIIFFragment__region {
  position: absolute;
  background-color: var(--impresso-color-pastel-blue-alpha-20);
  z-index: 2;
  mix-blend-mode: multiply;
}
</style>
