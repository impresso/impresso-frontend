<template>
  <div class="IIIFFragment">
    <figure class="position-relative IIIFFragment overflow-hidden">
      <auth-img
        v-if="isIiifReady"
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
    <div v-if="hasErrors" class="bg-light border rounded position-absolute top-0 p-4 text-center">
      <div v-if="isForbidden">
        This image is available with a different plan or special membership.
        <br />
        Please check your subscription details.
      </div>
      <div v-else-if="isNotFound">
        This image is not available.
        <br />
        Details: <em>{{ errorMessage }}</em>
      </div>
      <div v-else-if="errorMessage">
        We ran into a problem while loading the image.<br />
        Details: <em>{{ errorMessage }}</em>
      </div>
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

export interface IParsedSize {
  type: 'max' | 'exact' | 'bestfit' | 'width' | 'height' | 'percentage' | 'unknown'
  upscale: boolean
  width?: number
  height?: number
  percentage?: number
  maintain_aspect_ratio?: boolean
}

// IIIF v3 spec level1 profile interface
export interface IIIIFProfile {
  width: number
  height: number
  sizes: { width: number; height: number }[]
  profile: 'level1'
}

export interface ICoords {
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
      isForbidden: false,
      errorMessage: null,
      adjustedSize: null,
      isIiifReady: false
    }
  },
  props: {
    iiif: {
      // IIIF info URL
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
      type: Array as PropType<{ coords?: ICoords }[]>,
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
    parsedSize() {
      const size = this.size

      // Return shape that contains parsed information
      const result: IParsedSize = {
        type: 'unknown',
        upscale: false
      }

      // Handle max
      if (size === 'max') {
        result.type = 'max'
        return result
      }

      // Handle ^max (upscaled max)
      if (size === '^max') {
        result.type = 'max'
        result.upscale = true
        return result
      }

      // Handle upscale prefix
      const upscale = size.startsWith('^')
      const sizeValue = upscale ? size.substring(1) : size
      result.upscale = upscale

      // Handle percentage
      if (sizeValue.startsWith('pct:')) {
        result.type = 'percentage'
        result.percentage = parseFloat(sizeValue.substring(4))
        return result
      }

      // Handle width only (w,)
      if (sizeValue.match(/^\d+,$/)) {
        result.type = 'width'
        result.width = parseInt(sizeValue.replace(',', ''), 10)
        return result
      }

      // Handle height only (,h)
      if (sizeValue.match(/^,\d+$/)) {
        result.type = 'height'
        result.height = parseInt(sizeValue.substring(1), 10)
        return result
      }

      // Handle best fit (!w,h)
      if (sizeValue.startsWith('!')) {
        const dimensions = sizeValue.substring(1).split(',')
        if (dimensions.length === 2) {
          result.type = 'bestfit'
          result.width = parseInt(dimensions[0], 10)
          result.height = parseInt(dimensions[1], 10)
          result.maintain_aspect_ratio = true
          return result
        }
      }

      // Handle exact dimensions (w,h)
      const dimensions = sizeValue.split(',')
      if (dimensions.length === 2) {
        result.type = 'exact'
        result.width = parseInt(dimensions[0], 10)
        result.height = parseInt(dimensions[1], 10)
        return result
      }

      // Default fallback
      return result
    },
    computedImageUrl() {
      // remove inof.json from IIIF if any
      let iiif = this.iiif.replace('/info.json', '')

      const size = this.adjustedSize ?? this.size

      if (this.regions.length && this.fitToRegions) {
        const coords = this.getCoordsFromArticleRegions()
        if (coords.w * coords.h < this.coordMinArea) {
          return `${iiif}/full/${size}/0/default.jpg`
        }
        return `${iiif}/${coords.x},${coords.y},${coords.w},${coords.h}/${size}/0/default.jpg`
      }
      if (this.coords) {
        // /125,15,120,140/max/0/default.jpg
        const { x, y, w, h } = this.coords
        return `${iiif}/${x},${y},${w},${h}/${size}/0/default.jpg`
      }
      return `${iiif}/full/${size}/0/default.jpg`
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
    },
    hasErrors() {
      return this.isNotFound || this.isForbidden || !!this.errorMessage
    }
  },
  methods: {
    onImageLoad(e: Event) {
      const target = e.target as HTMLImageElement
      this.imageWidth = target.naturalWidth
      this.imageHeight = target.naturalHeight
      this.isLoaded = true
    },
    onImageLoadError(e: Error & { status?: number }) {
      this.isNotFound = e.status === 404
      this.isForbidden = e.status === 403
      this.isLoaded = false
      this.errorMessage = e.message
    },

    requiresAuth(url: string) {
      const authCondition = this.authCondition ?? defaultAuthCondition
      const result = authCondition(url)
      return result
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
      // iiif url should be without info.json, it is not always the case
      const iiif = this.iiif.replace('/info.json', '')

      try {
        const response = await axios.get(`${iiif}/info.json`, {
          headers: this.getRequestHeaders(iiif)
        })

        this.width = response.data.width
        this.height = response.data.height
        this.adjustedSize = this.getBestSizeForProfile(this.parsedSize, response.data)
        this.isIiifReady = true
      } catch (error) {
        this.onImageLoadError({
          status: error.response?.status,
          message: error.response?.data?.error || error.message || 'Failed to load IIIF info'
        } as Error & { status?: number })
        this.adjustedSize = this.size
      }
    },
    /**
     * Determines the best possible IIIF size parameter based on parsed size and server capabilities
     * @param parsedSize Parsed size object
     * @param profile IIIF level1 profile object
     * @returns A string representing the closest possible size parameter
     */
    getBestSizeForProfile(parsedSize: IParsedSize, profile: IIIIFProfile): string {
      // Extract available image dimensions from profile
      const { width, height, sizes = [], profile: iiifProfile } = profile

      if (iiifProfile !== 'level1') {
        return this.size // Fallback to original size if not level1
      }

      // Determine supported features based on profile level
      // Level1 supports basic features by default
      const supportsByW = true // Level1 supports width-based sizing
      const supportsByH = true // Level1 supports height-based sizing
      const supportsWh = true // Level1 supports width,height sizing
      const supportsPercentage = true // Level1 supports percentage sizing

      // Level1 doesn't support upscaling by default
      const supportsUpscaling = false

      // Handle upscaling when not supported
      if (parsedSize.upscale && !supportsUpscaling) {
        parsedSize = { ...parsedSize, upscale: false }
      }

      // Find best matching predefined size if available
      const findClosestSize = (targetWidth?: number, targetHeight?: number) => {
        if (!targetWidth && !targetHeight) return null
        if (sizes.length === 0) return null

        // Sort sizes by area difference to find closest match
        return [...sizes].sort((a, b) => {
          const areaA = a.width * a.height
          const areaB = b.width * b.height
          const targetArea = (targetWidth || width) * (targetHeight || height)
          return Math.abs(areaA - targetArea) - Math.abs(areaB - targetArea)
        })[0]
      }

      // Generate size parameter based on type
      let result: string

      switch (parsedSize.type) {
        case 'max':
          result = 'max' // Always supported in level1
          break

        case 'width': {
          if (!supportsByW) {
            return 'max'
          }

          let sizeWidth = parsedSize.width || 0
          // Check for closest predefined size
          const closestWidthSize = findClosestSize(sizeWidth, undefined)
          if (closestWidthSize) {
            sizeWidth = closestWidthSize.width
          }

          // Ensure width is not larger than image
          sizeWidth = Math.min(sizeWidth, width)
          result = `${sizeWidth},`
          break
        }

        case 'height': {
          if (!supportsByH) {
            return 'max'
          }

          let sizeHeight = parsedSize.height || 0
          // Check for closest predefined size
          const closestHeightSize = findClosestSize(undefined, sizeHeight)
          if (closestHeightSize) {
            sizeHeight = closestHeightSize.height
          }

          // Ensure height is not larger than image
          sizeHeight = Math.min(sizeHeight, height)
          result = `,${sizeHeight}`
          break
        }
        case 'percentage': {
          if (!supportsPercentage) {
            return 'max'
          }

          const percentage = Math.min(parsedSize.percentage || 100, 100) // Limit to 100% for level1
          result = `pct:${percentage}`
          break
        }
        case 'exact':
        case 'bestfit': {
          if (!supportsWh) {
            return 'max'
          }

          let sizeW = parsedSize.width || 0
          let sizeH = parsedSize.height || 0

          // Check for closest predefined size
          const closestSize = findClosestSize(sizeW, sizeH)
          if (closestSize && parsedSize.type === 'bestfit') {
            sizeW = closestSize.width
            sizeH = closestSize.height
          } else {
            // Ensure dimensions are not larger than image for level1
            sizeW = Math.min(sizeW, width)
            sizeH = Math.min(sizeH, height)
          }

          result = `${sizeW},${sizeH}`
          break
        }
        default:
          // For unknown types, default to max
          result = 'max'
      }

      return result
    }
  },
  components: {
    AuthImg
  },
  async mounted() {
    await this.getIIIFInfo()
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
