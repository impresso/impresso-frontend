<template>
  <div class="ImgAuthentified" :style="style">
    <div v-if="errorMessage" class="p-2 text-small">{{ errorMessage }}</div>
    <div v-else class="ImgAuthentified_image" :style="imageStyle" />
    <div v-if="!errorMessage && isVisible" class="ImgAuthentified_loader">
      <slot name="loading">loading...</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { getAuthenticationToken } from '@/services'
import { getAuthHeaders } from '@/util/auth'
import { defaultAuthCondition } from '@/util/imageAuth'
import axios from 'axios'
import { Buffer } from 'buffer'
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    isVisible: false,
    isReady: false,
    width: 0,
    imageWidthHeightRatio: 0,
    imageSrc: null,
    errorMessage: null,
    observer: undefined
  }),
  props: {
    height: {
      type: Number
    },
    src: {
      type: String,
      required: true
    },
    authCondition: {
      type: Function,
      default: defaultAuthCondition
    },
    defaultVisibility: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    style() {
      if (this.height) {
        return {
          height: this.height + 'px'
        }
      }
      const height = this.imageWidthHeightRatio
        ? this.width / this.imageWidthHeightRatio
        : this.width
      return {
        height: height + 'px'
      }
    },
    imageStyle() {
      return {
        height: '100%',
        opacity: this.isReady ? 1 : 0,
        backgroundImage: this.imageSrc ? `url(${this.imageSrc})` : null
      }
    }
  },
  mounted() {
    this.observer.observe(this.$el)
    const rect = this.$el.getBoundingClientRect()
    this.width = rect.width
    if (this.defaultVisibility) {
      this.isVisible = true
    }
  },
  beforeUnmount() {
    this.observer.disconnect()
  },
  created() {
    this.observer = new IntersectionObserver(this.onElementObserved, {
      root: this.$el,
      threshold: 1.0
    })
  },
  methods: {
    onElementObserved(entries) {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) {
          return
        }
        this.isVisible = true
        this.observer.unobserve(target)
      })
    }
  },
  watch: {
    isVisible: {
      async handler() {
        const imageUrl = this.src
        console.log('Fetching image:', imageUrl)

        const authCondition = this.authCondition ?? defaultAuthCondition
        const headers = authCondition(imageUrl) ? getAuthHeaders(getAuthenticationToken()) : {}

        await axios
          .get(imageUrl, {
            responseType: 'arraybuffer',
            headers
          })
          .then(({ data, status, headers }) => {
            if (status === 200) {
              const base64 = Buffer.from(data, 'binary').toString('base64')

              this.isReady = true
              // build up the image in mmory
              var i = new Image()

              i.onload = () => {
                this.imageWidthHeightRatio = i.naturalWidth / i.naturalHeight
                this.imageSrc = i.src
              }

              i.src = `data:${headers['content-type']};charset=utf-8;base64,${base64}`
            }
          })
          .catch(err => {
            // notably CORS
            console.warn(err.message, imageUrl)
            if (err.response) {
              console.warn(err.response.status)
              this.errorMessage = this.$t('login_message')
            } else {
              this.errorMessage = [err.message, err.code].join('. ')
            }
          })
      }
    }
  }
})
</script>
<style lang="scss">
.ImgAuthentified {
  position: relative;
  background-color: transparent;
  .ImgAuthentified_image {
    width: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    background-size: contain;
    background-repeat: no-repeat;
    background-color: transparent;
    z-index: 1;
    position: relative;
  }
  .ImgAuthentified_loader {
    position: absolute;
    top: 0;
    z-index: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "login_message": "Login to view image"
  }
}
</i18n>
