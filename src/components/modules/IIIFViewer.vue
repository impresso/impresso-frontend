<template>
  <div class="IIIFViewer" ref="viewerContainer">
    <div v-if="errorKind != null" class="forbidden-overlay">
      <div class="forbidden-message">
        <div class="error-description" v-if="errorKind === 'forbidden'">
          {{ $t('errorMessageForbidden') }}
        </div>
        <div class="error-description" v-else>
          {{ $t('errorMessageGeneric', { errorMessage: errorKind }) }}
        </div>
      </div>
    </div>
    <div class="fullscreen-toggle position-absolute bottom-0 p-2" style="z-index: 1">
      <button class="btn btn-sm small-caps btn-primary" @click="toggleFullscreen">
        {{ fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
import {
  createOpenSeadragon,
  Viewer,
  getAuthOptions,
  isAuthRequired
} from '@/services/openseadragon'

export interface OverlayCoords {
  x: number // x coordinate (in image pixel units)
  y: number // y coordinate (in image pixel units)
  w: number // width (in image pixel units)
  h: number // height (in image pixel units)
}

export interface Overlay {
  id: string
  regions: {
    id: string
    coords: OverlayCoords
  }[]
}

export interface IIIFViewerProps {
  manifestUrls: string[]
  // zoom in a and set bounds using this index
  fitBoundsToOverlayIdx?: [number, number]
  margin?: number
  // Optional array of overlay regions to display on the image.
  // number of overlays is equal to number of manifestUrls
  overlays?: Overlay[]
  openseadragonCssClass?: string
}

const fullscreen = ref(false)

const currentOverlayIdx = ref<[number, number]>([-1, -1])

// Define props with defaults.
const props = withDefaults(defineProps<IIIFViewerProps>(), {
  overlays: () => [],
  margin: 50,
  fitBoundsToOverlayIdx: () => [-1, -1],
  fullscreen: false
})

// define emits
const emit = defineEmits(['clickOnOverlayRegion'])

const viewerContainer = ref<HTMLDivElement | null>(null)
const viewer = ref<Viewer | null>(null)

/**
 * Set to true if the viewer encounters an error when
 * trying to load a tile source or tiles.
 */
const errorKind = ref<'forbidden' | 'unknown' | undefined>()

const manifestUrlsChanged = computed(() => {
  return JSON.stringify(props.manifestUrls) // eslint-disable-line
})

const overlaysChanged = computed(() => {
  return JSON.stringify(props.overlays) // eslint-disable-line
})

/**
 * Clears current overlays and adds new overlays to the viewer.
 */
const addOverlays = () => {
  if (!viewer.value) return
  console.debug('[IIIFViewer] addOverlays')
  // Clear any existing overlays.
  viewer.value.clearOverlays()
  props.overlays.forEach((overlay, itemIdx) => {
    overlay.regions.forEach((region, regionIdx) => {
      // Convert the region’s image pixel coordinates into a viewport rectangle.
      const tiledImage = viewer.value.world.getItemAt(itemIdx) // Assuming the first image, adjust as needed
      const viewportRect = tiledImage.imageToViewportRectangle(
        region.coords.x,
        region.coords.y,
        region.coords.w,
        region.coords.h
      )
      // Create a div element to serve as the overlay.
      const overlayElement = document.createElement('div') as HTMLDivElement
      overlayElement.setAttribute('data-id', `${itemIdx}-${regionIdx}`)
      overlayElement.classList.add('overlay', 'rounded-sm')
      // add onclick and prevent zoom
      overlayElement.onclick = e => {
        e.stopPropagation()
        e.preventDefault()
        e.stopImmediatePropagation()
        console.debug('[IIIFViewer] @click on overlay', `${itemIdx}-${regionIdx}`)
        emit('clickOnOverlayRegion', {
          fitBoundsToOverlayIdx: [itemIdx, regionIdx],
          overlayId: overlay.id,
          regionId: region.id
        })
      }
      // Add the overlay element to the viewer.value.
      viewer.value.addOverlay(overlayElement, viewportRect)
    })
  })
}

const resetZoom = () => {
  if (!viewer.value) {
    console.debug('[IIIFViewer] resetZoom -> viewer not found')
    return
  }
  console.debug('[IIIFViewer] resetZoom to 0')

  const tiledImage = viewer.value.world.getItemAt(props.fitBoundsToOverlayIdx[0] || 0)
  if (!tiledImage) {
    console.warn('[IIIFViewer] resetZoom: Tiled image not found at index 0')
    return
  }
  const coords = tiledImage.getBounds()
  coords.x -= props.margin
  coords.y -= props.margin
  coords.width += props.margin * 2
  coords.height += props.margin * 2
  viewer.value.viewport.fitBoundsWithConstraints(coords, false)
  // Define a one-time event handler to perform the zoom once the fit animation is done.
  const onAnimationFinish = () => {
    // Animate zooming by 0.8 (false makes it animate rather than jump)
    // viewer.value.viewport.zoomBy(0.8, null, false)
    // Remove this handler so it doesn't trigger again
    viewer.value.removeHandler('animation-finish', onAnimationFinish)
  }

  // Listen for the animation finish event
  viewer.value.addHandler('animation-finish', onAnimationFinish)
}

const toggleOverlayActive = (idx: [number, number], active: boolean) => {
  if (!viewer.value) {
    console.debug('[IIIFViewer] toggleOverlayActive -> viewer not found')
    return
  }
  const overlayElement = viewer.value.element.querySelector(`.overlay[data-id="${idx.join('-')}"]`)
  if (!overlayElement) {
    console.debug(
      `[IIFViewer] toggleOverlayActive: overlay not found! overlay[data-id="${idx.join('-')}"]`
    )
    return
  }
  console.debug('[IIIFViewer] toggleOverlayActive:', idx.join(', '), active)
  overlayElement.classList.toggle('active', active)
}

const fitBoundsToOverlay = (idx: [number, number]) => {
  console.debug(
    '[IIIFViewer] fitBoundsToOverlay: ',
    idx.join(', '),
    'currentOverlayIdx:',
    currentOverlayIdx.value.join(', ')
  )
  if (idx[0] < 0 || idx[1] < 0) {
    resetZoom()
    return
  }
  if (currentOverlayIdx.value[0] === idx[0] && currentOverlayIdx.value[1] === idx[1]) {
    console.debug('[IIIFViewer] fitBoundsToOverlay: already zoomed to this overlay')
    return
  } else if (currentOverlayIdx.value[0] > -1) {
    console.debug('[IIIFViewer] fitBoundsToOverlay: reset current overlay')
    toggleOverlayActive(currentOverlayIdx.value, false)
    currentOverlayIdx.value = idx
  }

  const overlay = props.overlays[idx[0]].regions[idx[1]]
  currentOverlayIdx.value = idx
  toggleOverlayActive(idx, true)
  const coords = overlay.coords
  const tiledImage = viewer.value.world.getItemAt(idx[0])
  if (!tiledImage) {
    console.debug('[IIIFViewer] fitBoundsToOverlay: Tiled image not found at index', idx[0])
    return
  }
  const viewportRect = tiledImage.imageToViewportRectangle(
    coords.x - props.margin,
    coords.y - props.margin,
    coords.w + props.margin * 2,
    coords.h + props.margin * 2
  )

  viewer.value.viewport.fitBoundsWithConstraints(viewportRect, false)

  // Define a one-time event handler to perform the zoom once the fit animation is done.
  const onAnimationFinish = () => {
    // Animate zooming by 0.8 (false makes it animate rather than jump)
    // viewer.value.viewport.zoomBy(0.8, null, false)
    // Remove this handler so it doesn't trigger again
    viewer.value.removeHandler('animation-finish', onAnimationFinish)
  }

  // Listen for the animation finish event
  viewer.value.addHandler('animation-finish', onAnimationFinish)
}

const createViewer = () => {
  if (!viewerContainer.value) {
    console.debug('[IIIFViewer] createViewer -> viewerContainer not found!')
    return
  }
  console.debug('[IIIFViewer] createViewer')
  // Initialize OpenSeadragon with the initial IIIF tile source.
  viewer.value = createOpenSeadragon({
    element: viewerContainer.value,
    // no controls button
    showNavigationControl: false,
    collectionMode: true,
    collectionRows: 1,
    collectionLayout: 'vertical',
    collectionTileMargin: props.margin,
    showNavigator: true,
    // do not click and zoom, only double click
    gestureSettingsMouse: {
      clickToZoom: false
    }
  })
  //  add css class to openseadragon viewer
  if (props.openseadragonCssClass) {
    viewer.value.element.classList.add(...props.openseadragonCssClass.split(' '))
  }

  // Once the image is loaded, add the overlays.
  viewer.value.addHandler('open', () => {
    // Use nextTick to ensure the viewport is fully initialized.
    console.debug('[IIIFViewer] @open n.tiles:', props.manifestUrls.length)

    nextTick(() => {
      addOverlays()
      fitBoundsToOverlay(props.fitBoundsToOverlayIdx)
    })
  })

  // Handle failure to open a tile source
  viewer.value.addHandler('open-failed', event => {
    if (event.message && event.message.includes('403')) {
      errorKind.value = 'forbidden'
    } else {
      errorKind.value = 'unknown'
    }
    console.error('[IIIFViewer] @open-failed:', event)
  })

  // Handle failure to load individual tiles
  viewer.value.addHandler('tile-load-failed', event => {
    if (event.message && event.message.includes('load aborted')) {
      errorKind.value = 'forbidden'
    } else {
      errorKind.value = 'unknown'
    }
    console.error('[IIIFViewer] @tile-load-failed:', event)
  })
}

watch([manifestUrlsChanged, overlaysChanged], _ => {
  console.debug('[IIIFViewer] manifestUrls changed to:', props.manifestUrls)
  // Reset error kind when manifest URLs change
  errorKind.value = undefined

  if (!viewer.value) {
    createViewer()
  }
  // @todo: handle case when manifesturls do not change
  viewer.value.open(
    props.manifestUrls.map(url => ({
      tileSource: url,
      ...(isAuthRequired(url) ? getAuthOptions() : {})
    }))
  )
})

watch(
  () => props.fitBoundsToOverlayIdx,
  v => {
    if (viewer.value) {
      console.debug('[IIIFViewer] fitBoundsToOverlayIdx changed to:', v)
      fitBoundsToOverlay(v)
    }
  }
)

const toggleFullscreen = () => {
  if (!viewerContainer.value) return
  fullscreen.value = !fullscreen.value
  if (fullscreen.value) {
    viewerContainer.value.requestFullscreen().catch(err => {
      console.error('[IIIFViewer] Error attempting to enable fullscreen mode:', err)
    })
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('[IIIFViewer] Error attempting to exit fullscreen mode:', err)
      })
    }
  }
}

onMounted(() => {
  console.debug('[IIIFViewer] onMounted')
  createViewer()
  viewer.value.open(
    props.manifestUrls.map(url => ({
      tileSource: url,
      ...(isAuthRequired(url) ? getAuthOptions() : {})
    }))
  )
  // get fullscreen listener
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fullscreen.value = false
    }
  })
})

onBeforeUnmount(() => {
  if (viewer.value) {
    console.debug('[IIIFViewer] onBeforeUnmount destroy viewer')
    viewer.value.destroy()
    viewer.value = null
  }
})
</script>

<style type="text/css">
.IIIFViewer .viewer-container {
  width: 100%;
  height: 600px; /* Adjust the height as needed */
  position: relative;
}

/* Optional styling for overlay elements */
.IIIFViewer .overlay {
  position: absolute;
  background-color: rgba(86, 204, 242, 0);
  cursor: pointer;
  border: 1px solid rgb(0, 114, 152);
  mix-blend-mode: multiply;
  transition:
    background-color 0.2s var(--impresso-transition-ease),
    border-color 0.2s var(--impresso-transition-ease);
  box-shadow:
    0 0 8px rgba(0, 0, 0, 0.35),
    inset 0 0 2px rgba(0, 0, 0, 0.35);
}
.IIIFViewer .overlay:hover,
.IIIFViewer .overlay.active {
  background-color: rgba(86, 204, 242, 0.5);
  border-color: rgba(86, 204, 242, 1);
}
.IIIFViewer .openseadragon-container {
  overflow: hidden;
}

.IIIFViewer .forbidden-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.IIIFViewer .forbidden-message {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.IIIFViewer .error-code {
  font-size: 4rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.IIIFViewer .error-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.IIIFViewer .error-description {
  color: #555;
}
</style>

<i18n lang="json">
{
  "en": {
    "errorMessageForbidden": "This image is available with a different plan or special membership. Please check your subscription details.",
    "errorMessageGeneric": "We ran into a problem while loading the image. Details: { errorMessage }. Please try again later or contact support if the problem persists."
  }
}
</i18n>
