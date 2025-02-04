<template>
  <div ref="viewerContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
import OpenSeadragon, { Viewer } from 'openseadragon'

interface OverlayCoords {
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

// Define props with defaults.
const props = withDefaults(defineProps<IIIFViewerProps>(), {
  overlays: () => [],
  margin: 50,
  fitBoundsToOverlayIdx: () => [-1, -1]
})

// define emits
const emit = defineEmits(['clickOnOverlayRegion'])

const viewerContainer = ref<HTMLDivElement | null>(null)
const viewer = ref<Viewer | null>(null)
const isViewerReady = ref(false)

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
      overlayElement.style.border = '1px solid red'
      overlayElement.style.backgroundColor = 'rgba(255, 0, 0, 0.12)'
      // add onclick and prevent zoom
      overlayElement.onclick = e => {
        e.stopPropagation()
        e.preventDefault()
        e.stopImmediatePropagation()
        console.debug('[IIIFViewer] @click on overlay', region.id)
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

const fitBoundsToOverlay = (idx: [number, number]) => {
  console.debug('[IIIFViewer] fitBoundsToOverlay: ', idx.join(', '))
  if (idx[0] < 0 || idx[1] < 0) {
    resetZoom()
    return
  }
  const overlay = props.overlays[idx[0]].regions[idx[1]]
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
  viewer.value = OpenSeadragon({
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
}

watch([manifestUrlsChanged, overlaysChanged], _ => {
  console.debug('[IIIFViewer] manifestUrls changed to:', props.manifestUrls)
  if (!viewer.value) {
    createViewer()
  }
  // @todo: handle case when manifesturls do not change
  viewer.value.open(props.manifestUrls)
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

onMounted(() => {
  console.debug('[IIIFViewer] onMounted')
  createViewer()
  viewer.value.open(props.manifestUrls)
})

onBeforeUnmount(() => {
  if (viewer.value) {
    console.debug('[IIIFViewer] onBeforeUnmount destroy viewer')
    viewer.value.destroy()
    viewer.value = null
  }
})
</script>

<style>
.IIIFViewer .viewer-container {
  width: 100%;
  height: 600px; /* Adjust the height as needed */
  position: relative;
}

/* Optional styling for overlay elements */
.overlay {
  position: absolute;
}
.openseadragon-container {
  overflow: hidden;
}
</style>
