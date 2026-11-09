<template>
  <div class="IIIFViewer" ref="viewerContainer">
    <div v-if="loadError" class="forbidden-overlay" role="alert">
      <div class="error forbidden-message m-3 d-flex flex-column align-items-center gap-2">
        <template v-if="loadError.kind === 'auth'">
          <span>{{ $t('login_message') }}</span>
        </template>
        <template v-else>
          <strong>
            {{ $t(loadError.kind === 'network' ? 'error_network' : 'error_loading_image') }}
          </strong>
          <small v-if="loadError.kind === 'network'" class="text-muted">
            {{ $t('error_network_hint') }}
          </small>
          <small v-if="loadError.message" class="text-muted font-monospace">
            {{ loadError.message }}
          </small>
          <button class="btn btn-sm btn-primary small-caps" @click="openManifests">
            {{ $t('retry') }}
          </button>
        </template>
      </div>
    </div>
    <div
      class="controls position-absolute bottom-0 p-2 d-flex gap-2 align-items-center justify-content-between w-100"
    >
      <button class="btn btn-sm small-caps btn-primary" @click="toggleFullscreen">
        {{ fullscreen ? $t('exitFullscreen') : $t('enterFullscreen') }}
      </button>
      <BFormCheckbox v-model="showOverlays" switch class="text-white">
        <span class="small-caps-bold">{{ $t('showRegions') }}</span>
      </BFormCheckbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, watch, computed, nextTick } from 'vue'
import {
  createOpenSeadragon,
  Viewer,
  getAuthOptions,
  isAuthRequired
} from '@/services/openseadragon'
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue'

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
  // zoom in and set bounds using this index
  fitBoundsToOverlayIdx?: [number, number]
  margin?: number
  // Optional array of overlay regions to display on the image.
  // number of overlays is equal to number of manifestUrls
  overlays?: Overlay[]
  openseadragonCssClass?: string
}

const showOverlays = ref(true)
const fullscreen = ref(false)

const currentOverlayIdx = ref<[number, number]>([-1, -1])

// Define props with defaults.
const props = withDefaults(defineProps<IIIFViewerProps>(), {
  overlays: () => [],
  margin: 50,
  fitBoundsToOverlayIdx: () => [-1, -1]
})

// define emits
const emit = defineEmits(['clickOnOverlayRegion', 'ready'])

const viewerContainer = ref<HTMLDivElement | null>(null)
// shallowRef: avoid Vue deep-proxying the whole OpenSeadragon instance.
const viewer = shallowRef<Viewer | null>(null)

/* ------------------------------------------------------------------ */
/* Load errors                                                        */
/* ------------------------------------------------------------------ */

interface IIIFLoadError {
  kind: 'auth' | 'network' | 'generic'
  message: string
}

const loadError = ref<IIIFLoadError | null>(null)

// Chrome: "Failed to fetch", Firefox: "NetworkError when attempting to fetch resource.",
// Safari: "Load failed". OpenSeadragon reports unreachable tiles as "HTTP 0".
const NETWORK_ERROR_RE =
  /failed to fetch|networkerror|load failed|network request failed|\bHTTP 0\b/i

const setLoadError = (raw?: unknown, status?: number) => {
  const message =
    typeof raw === 'string'
      ? raw
      : raw instanceof Error
        ? raw.message
        : ((raw as any)?.message ?? '')
  const isAuth = status === 401 || status === 403 || /\b(?:401|403)\b/.test(message)
  const kind: IIIFLoadError['kind'] = isAuth
    ? 'auth'
    : status === 0 || NETWORK_ERROR_RE.test(message)
      ? 'network'
      : 'generic'
  // tile-load-failed fires once per tile: don't let a later generic error replace an auth error.
  if (loadError.value?.kind === 'auth' && kind !== 'auth') return
  loadError.value = { kind, message }
}

// Shared by open-failed, add-item-failed and tile-load-failed.
// Network failures often have no tileRequest/status, so everything is optional-chained.
const onLoadFailure = (event: any) => {
  console.error('[IIIFViewer] load failure:', event)
  setLoadError(event?.message, event?.tileRequest?.status)
}

const manifestUrlsChanged = computed(() => JSON.stringify(props.manifestUrls))
const overlaysChanged = computed(() => JSON.stringify(props.overlays))

/* ------------------------------------------------------------------ */
/* Overlays                                                           */
/* ------------------------------------------------------------------ */

/**
 * Clears current overlays and adds new overlays to the viewer.
 */
const addOverlays = () => {
  const v = viewer.value
  if (!v) return
  console.debug('[IIIFViewer] addOverlays')
  // Clear any existing overlays.
  v.clearOverlays()
  props.overlays.forEach((overlay, itemIdx) => {
    // If a manifest failed to load, its tiled image is missing: skip its regions.
    const tiledImage = v.world.getItemAt(itemIdx)
    if (!tiledImage) {
      console.debug('[IIIFViewer] addOverlays: no tiled image at index', itemIdx)
      return
    }
    overlay.regions.forEach((region, regionIdx) => {
      // Convert the region’s image pixel coordinates into a viewport rectangle.
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
      if (!showOverlays.value) {
        overlayElement.classList.add('hidden')
      }
      // add onclick and prevent zoom
      overlayElement.addEventListener('pointerdown', e => {
        e.stopPropagation()
        e.preventDefault()
        e.stopImmediatePropagation()
        console.debug('[IIIFViewer] @click on overlay', `${itemIdx}-${regionIdx}`)
        emit('clickOnOverlayRegion', {
          fitBoundsToOverlayIdx: [itemIdx, regionIdx],
          overlayId: overlay.id,
          regionId: region.id
        })
      })
      // Add the overlay element to the viewer.
      v.addOverlay(overlayElement, viewportRect)
    })
  })
  // Re-apply the active state if an overlay was active before the rebuild.
  if (currentOverlayIdx.value[0] > -1) {
    toggleOverlayActive(currentOverlayIdx.value, true)
  }
}

const toggleOverlayActive = (idx: [number, number], active: boolean) => {
  const v = viewer.value
  if (!v) {
    console.debug('[IIIFViewer] toggleOverlayActive -> viewer not found')
    return
  }
  const overlayElement = v.element.querySelector(`.overlay[data-id="${idx.join('-')}"]`)
  if (!overlayElement) {
    console.debug(
      `[IIIFViewer] toggleOverlayActive: overlay not found! overlay[data-id="${idx.join('-')}"]`
    )
    return
  }
  console.debug('[IIIFViewer] toggleOverlayActive:', idx.join(', '), active)
  overlayElement.classList.toggle('active', active)
}

/* ------------------------------------------------------------------ */
/* Zoom / navigation                                                  */
/* ------------------------------------------------------------------ */

const resetZoom = () => {
  const v = viewer.value
  if (!v) {
    console.debug('[IIIFViewer] resetZoom -> viewer not found')
    return
  }
  console.debug('[IIIFViewer] resetZoom to 0')

  // Clear the active overlay so a subsequent click on it fits bounds again instead of no-op-ing.
  if (currentOverlayIdx.value[0] > -1) {
    toggleOverlayActive(currentOverlayIdx.value, false)
  }
  currentOverlayIdx.value = [-1, -1]

  const overlayIdx = props.fitBoundsToOverlayIdx[0]
  const tiledImage = v.world.getItemAt(overlayIdx >= 0 ? overlayIdx : 0)
  if (!tiledImage) {
    console.warn('[IIIFViewer] resetZoom: Tiled image not found')
    return
  }
  const coords = tiledImage.getBounds()
  coords.x -= props.margin
  coords.y -= props.margin
  coords.width += props.margin * 2
  coords.height += props.margin * 2
  v.viewport.fitBoundsWithConstraints(coords, false)
}

/**
 * Recenters the viewport on arbitrary pixel coordinates, independent of the
 * `overlays`/`fitBoundsToOverlayIdx` props. Useful for callers that just want
 * to point the viewer at a region without maintaining an overlays array.
 */
const recenterToCoords = (coords: OverlayCoords, itemIdx = 0) => {
  const v = viewer.value
  if (!v) {
    console.debug('[IIIFViewer] recenterToCoords -> viewer not found')
    return
  }
  const tiledImage = v.world.getItemAt(itemIdx)
  if (!tiledImage) {
    console.debug('[IIIFViewer] recenterToCoords: Tiled image not found at index', itemIdx)
    return
  }
  const viewportRect = tiledImage.imageToViewportRectangle(
    coords.x - props.margin,
    coords.y - props.margin,
    coords.w + props.margin * 2,
    coords.h + props.margin * 2
  )
  v.viewport.fitBoundsWithConstraints(viewportRect, false)
}

const fitBoundsToOverlay = (idx: [number, number]) => {
  const v = viewer.value
  if (!v) {
    console.debug('[IIIFViewer] fitBoundsToOverlay -> viewer not found')
    return
  }
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
    // Clicking the already-active overlay again resets the position instead of no-op-ing.
    console.debug('[IIIFViewer] fitBoundsToOverlay: already zoomed to this overlay, resetting')
    resetZoom()
    return
  }

  const region = props.overlays[idx[0]]?.regions[idx[1]]
  if (!region) {
    console.debug('[IIIFViewer] fitBoundsToOverlay: region not found at', idx.join(', '))
    return
  }
  const tiledImage = v.world.getItemAt(idx[0])
  if (!tiledImage) {
    console.debug('[IIIFViewer] fitBoundsToOverlay: Tiled image not found at index', idx[0])
    return
  }

  if (currentOverlayIdx.value[0] > -1) {
    console.debug('[IIIFViewer] fitBoundsToOverlay: reset current overlay')
    toggleOverlayActive(currentOverlayIdx.value, false)
  }
  currentOverlayIdx.value = idx
  toggleOverlayActive(idx, true)

  const coords = region.coords
  const viewportRect = tiledImage.imageToViewportRectangle(
    coords.x - props.margin,
    coords.y - props.margin,
    coords.w + props.margin * 2,
    coords.h + props.margin * 2
  )
  v.viewport.fitBoundsWithConstraints(viewportRect, false)
}

/* ------------------------------------------------------------------ */
/* Viewer lifecycle                                                   */
/* ------------------------------------------------------------------ */

const createViewer = () => {
  if (!viewerContainer.value) {
    console.debug('[IIIFViewer] createViewer -> viewerContainer not found!')
    return
  }
  console.debug('[IIIFViewer] createViewer')
  // Initialize OpenSeadragon with the initial IIIF tile source.
  const v = createOpenSeadragon({
    element: viewerContainer.value,
    // no controls button
    showNavigationControl: false,
    collectionMode: true,
    collectionRows: 1,
    collectionLayout: 'vertical',
    collectionTileMargin: props.margin,
    showNavigator: true,
    // retry transient tile failures before reporting an error
    tileRetryMax: 2,
    tileRetryDelay: 1000,
    // do not click and zoom, only double click
    gestureSettingsMouse: {
      clickToZoom: false
    }
  })
  viewer.value = v

  //  add css class to openseadragon viewer
  if (props.openseadragonCssClass) {
    v.element.classList.add(...props.openseadragonCssClass.split(' '))
  }

  // Once the image is loaded, add the overlays.
  v.addHandler('open', () => {
    console.debug('[IIIFViewer] @open n.tiles:', props.manifestUrls.length)
    // Use nextTick to ensure the viewport is fully initialized.
    nextTick(() => {
      if (!viewer.value) return // unmounted in the meantime
      // Overlay elements were rebuilt/cleared by the (re)open: forget any stale active state.
      currentOverlayIdx.value = [-1, -1]
      addOverlays()
      fitBoundsToOverlay(props.fitBoundsToOverlayIdx)
      // Emitted last so a caller's recenterToCoords/resetView call (if any) has the final say.
      emit('ready')
    })
  })

  // Failure to open a tile source (all items failed), a single item, or an individual tile.
  v.addHandler('open-failed', onLoadFailure)
  v.addHandler('add-item-failed', onLoadFailure)
  v.addHandler('tile-load-failed', onLoadFailure)
}

/**
 * (Re)opens all manifests. Also used by the "Retry" button in the error overlay.
 */
const openManifests = () => {
  loadError.value = null
  if (!viewer.value) {
    createViewer()
  }
  viewer.value?.open(
    props.manifestUrls.map(url => ({
      tileSource: url,
      ...(isAuthRequired(url) ? getAuthOptions() : {})
    }))
  )
}

watch([manifestUrlsChanged, overlaysChanged], ([manifests, overlays], [prevManifests]) => {
  if (manifests !== prevManifests) {
    console.debug('[IIIFViewer] manifestUrls changed to:', props.manifestUrls)
    // The `open` handler adds the overlays once the images are loaded.
    openManifests()
  } else if (viewer.value) {
    // Only the overlays changed: no need to reload the images.
    console.debug('[IIIFViewer] overlays changed')
    addOverlays()
  }
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

watch(showOverlays, isVisible => {
  if (!viewer.value) return
  console.debug('[IIIFViewer] showOverlays changed to:', isVisible)
  const overlayElements = viewer.value.element.querySelectorAll('.overlay')
  overlayElements.forEach(element => {
    element.classList.toggle('hidden', !isVisible)
  })
})

/* ------------------------------------------------------------------ */
/* Fullscreen                                                         */
/* ------------------------------------------------------------------ */

// `fullscreen` is driven only by the browser's fullscreenchange event, so it never
// gets out of sync when requestFullscreen() is rejected or the user presses Esc.
const onFullscreenChange = () => {
  fullscreen.value = !!viewerContainer.value && document.fullscreenElement === viewerContainer.value
}

const toggleFullscreen = () => {
  if (!viewerContainer.value) return
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(err => {
      console.error('[IIIFViewer] Error attempting to exit fullscreen mode:', err)
    })
  } else {
    viewerContainer.value.requestFullscreen().catch(err => {
      console.error('[IIIFViewer] Error attempting to enable fullscreen mode:', err)
    })
  }
}

onMounted(() => {
  console.debug('[IIIFViewer] onMounted')
  openManifests()
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (viewer.value) {
    console.debug('[IIIFViewer] onBeforeUnmount destroy viewer')
    viewer.value.destroy()
    viewer.value = null
  }
})

// Imperative API for callers that'd rather hold a template ref than manage the overlays/
// fitBoundsToOverlayIdx props (e.g. recentering on a region without an overlays array).
defineExpose({
  recenterToCoords,
  resetView: resetZoom
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
    border-color 0.2s var(--impresso-transition-ease),
    opacity 0.2s var(--impresso-transition-ease);
  box-shadow:
    0 0 8px rgba(0, 0, 0, 0.35),
    inset 0 0 2px rgba(0, 0, 0, 0.35);
}
.IIIFViewer .overlay.hidden {
  opacity: 0;
  pointer-events: none;
  border-color: transparent;
  background-color: transparent;
  box-shadow: none;
}
.IIIFViewer .overlay:hover,
.IIIFViewer .overlay.active {
  background-color: rgba(86, 204, 242, 0.5);
  border-color: rgba(86, 204, 242, 1);
}
.IIIFViewer .overlay.active.hidden,
.IIIFViewer .overlay.hidden {
  opacity: 0;
}
.IIIFViewer .openseadragon-container {
  overflow: hidden;
}

.IIIFViewer .controls {
  z-index: 1;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3), transparent);
  border-radius: 8px;

  padding: 0.75rem !important;
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
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.IIIFViewer .forbidden-message small {
  overflow-wrap: anywhere;
}
</style>

<i18n lang="json">
{
  "en": {
    "login_message": "You need to be signed in to view this image",
    "error_loading_image": "The image could not be loaded",
    "error_network": "Network error",
    "error_network_hint": "The image server could not be reached. Check your connection and try again.",
    "retry": "Retry",
    "enterFullscreen": "Enter Fullscreen",
    "exitFullscreen": "Exit Fullscreen",
    "showRegions": "Show Regions"
  }
}
</i18n>
