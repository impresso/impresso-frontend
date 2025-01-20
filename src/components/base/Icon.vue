<template>
  <svg
    :width="width * scaleValue"
    :height="height * scaleValue"
    :viewBox="computedSvgViewbox"
    :class="{ Icon: true }"
  >
    <g>
      <path
        v-for="path in computedPaths"
        :key="path.d"
        :d="path.d"
        :style="coerceStyleType(path.style)"
        :strokeWidth="strokeWidth"
      />
      <polygon v-for="poly in computedPolygons" :key="poly.points" :points="poly.points" />
    </g>
  </svg>
</template>
<script setup lang="ts">
// usage <icon name="slack" />
import { computed, type CSSProperties } from 'vue'

interface Path {
  d: string
  style?: string
}

interface Polygon {
  points: string
}

interface IconData {
  width: number
  height: number
  paths: Path[]
  polygons?: Polygon[]
}

const coerceStyleType = (style: string | undefined): CSSProperties => {
  return style as any as CSSProperties
}

const props = defineProps({
  name: {
    type: String,
    default: 'slack'
  },
  scale: {
    type: [Number, String],
    default: 1
  },
  paths: {
    type: Array,
    default: () => []
  },
  polygons: {
    type: Array,
    default: () => []
  },
  width: {
    type: Number,
    default: 24
  },
  height: {
    type: Number,
    default: 24
  },
  strokeWidth: {
    type: Number,
    default: 1
  }
})

const Icons: Record<string, IconData> = {
  slack: {
    width: 1664,
    height: 1792,
    paths: [
      {
        d: 'M1519 776q62 0 103.5 40.5t41.5 101.5q0 97-93 130l-172 59 56 167q7 21 7 47 0 59-42 102t-101 43q-47 0-85.5-27t-53.5-72l-55-165-310 106 55 164q8 24 8 47 0 59-42 102t-102 43q-47 0-85-27t-53-72l-55-163-153 53q-29 9-50 9-61 0-101.5-40t-40.5-101q0-47 27.5-85t71.5-53l156-53-105-313-156 54q-26 8-48 8-60 0-101-40.5t-41-100.5q0-47 27.5-85t71.5-53l157-53-53-159q-8-24-8-47 0-60 42-102.5t102-42.5q47 0 85 27t53 72l54 160 310-105-54-160q-8-24-8-47 0-59 42.5-102t101.5-43q47 0 85.5 27.5t53.5 71.5l53 161 162-55q21-6 43-6 60 0 102.5 39.5t42.5 98.5q0 45-30 81.5t-74 51.5l-157 54 105 316 164-56q24-8 46-8zM725 1038l310-105-105-315-310 107z'
      }
    ]
  },
  search: {
    width: 24,
    height: 24,
    paths: [
      {
        style: `fill:transparent;stroke-width:${props.strokeWidth}px;`,
        d: 'M17 17L21 21'
      },
      {
        style: `fill:transparent;stroke-width:${props.strokeWidth}px;`,
        d: 'M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z'
      }
    ]
  },
  play: {
    width: 24,
    height: 24,
    paths: [
      {
        style: 'fill:white; stroke:black; stroke-width:1px;',
        d: 'M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z'
      }
    ]
  },
  edit: {
    width: 24,
    height: 24,
    paths: [
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;',
        d: 'M3 21L12 21H21'
      },
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;',
        d: 'M12.2218 5.82839L15.0503 2.99996L20 7.94971L17.1716 10.7781M12.2218 5.82839L6.61522 11.435C6.42769 11.6225 6.32233 11.8769 6.32233 12.1421L6.32233 16.6776L10.8579 16.6776C11.1231 16.6776 11.3774 16.5723 11.565 16.3847L17.1716 10.7781M12.2218 5.82839L17.1716 10.7781'
      }
    ]
  },
  check: {
    width: 24,
    height: 24,
    paths: [
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;',
        d: 'M7 12.5L10 15.5L17 8.5'
      },
      {
        d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      }
    ]
  },
  // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000" stroke-width="1.5"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.6 2.25C2.85442 2.25 2.25 2.85441 2.25 3.6V20.4C2.25 21.1456 2.85441 21.75 3.6 21.75H20.4C21.1456 21.75 21.75 21.1456 21.75 20.4V3.6C21.75 2.85442 21.1456 2.25 20.4 2.25H3.6ZM17.5303 9.03033C17.8232 8.73744 17.8232 8.26256 17.5303 7.96967C17.2374 7.67678 16.7626 7.67678 16.4697 7.96967L10 14.4393L7.53033 11.9697C7.23744 11.6768 6.76256 11.6768 6.46967 11.9697C6.17678 12.2626 6.17678 12.7374 6.46967 13.0303L9.46967 16.0303C9.76256 16.3232 10.2374 16.3232 10.5303 16.0303L17.5303 9.03033Z" fill="#000000"></path></svg>
  checkSquareSolid: {
    width: 24,
    height: 24,
    paths: [
      {
        style: `fill:currentColor; stroke-width:${props.strokeWidth}px;`,
        d: 'M3.6 2.25C2.85442 2.25 2.25 2.85441 2.25 3.6V20.4C2.25 21.1456 2.85441 21.75 3.6 21.75H20.4C21.1456 21.75 21.75 21.1456 21.75 20.4V3.6C21.75 2.85442 21.1456 2.25 20.4 2.25H3.6ZM17.5303 9.03033C17.8232 8.73744 17.8232 8.26256 17.5303 7.96967C17.2374 7.67678 16.7626 7.67678 16.4697 7.96967L10 14.4393L7.53033 11.9697C7.23744 11.6768 6.76256 11.6768 6.46967 11.9697C6.17678 12.2626 6.17678 12.7374 6.46967 13.0303L9.46967 16.0303C9.76256 16.3232 10.2374 16.3232 10.5303 16.0303L17.5303 9.03033Z'
      }
    ]
  },
  chevron: {
    width: 24,
    height: 24,
    paths: [
      {
        style: `fill:transparent; stroke:black; stroke-width:${props.strokeWidth}px;`,
        d: 'M6 9L12 15L18 9'
      }
    ]
  },
  cross: {
    width: 24,
    height: 24,
    paths: [
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;',
        d: 'M6 6L18 18'
      },
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;',
        d: 'M6 18L18 6'
      }
    ]
  },
  warningTriangle: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="30px" height="30px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M20.0429 21H3.95705C2.41902 21 1.45658 19.3364 2.22324 18.0031L10.2662 4.01533C11.0352 2.67792 12.9648 2.67791 13.7338 4.01532L21.7768 18.0031C22.5434 19.3364 21.581 21 20.0429 21Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 9V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path><path d="M12 17.01L12.01 16.9989" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    width: 24,
    height: 24,
    paths: [
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round;`,
        d: 'M20.0429 21H3.95705C2.41902 21 1.45658 19.3364 2.22324 18.0031L10.2662 4.01533C11.0352 2.67792 12.9648 2.67791 13.7338 4.01532L21.7768 18.0031C22.5434 19.3364 21.581 21 20.0429 21Z'
      },
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round;`,
        d: 'M12 9V13'
      },
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 17.01L12.01 16.9989'
      }
    ]
  },
  sendMail: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="30px" height="30px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M9 9L13.5 12L18 9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 13.5H5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M1 10.5H5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 7.5V7C5 5.89543 5.89543 5 7 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H7C5.89543 19 5 18.1046 5 17V16.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path></svg>
    width: 24,
    height: 24,
    paths: [
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M9 9L13.5 12L18 9'
      },
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M3 13.5H5'
      },
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M1 10.5H5'
      },
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round;`,
        d: 'M5 7.5V7C5 5.89543 5.89543 5 7 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H7C5.89543 19 5 18.1046 5 17V16.5'
      }
    ]
  },
  info: {
    width: 24,
    height: 24,
    paths: [
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;fill:transparent',
        d: 'M12 11.5V16.5'
      },
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;fill:transparent',
        d: 'M12 7.51L12.01 7.49889'
      },
      {
        style: 'stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;fill:transparent',
        d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      }
    ]
  },
  // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke="#000000" stroke-width="1.5"></path><path d="M7 12.5L10 15.5L17 8.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
  checkSquare: {
    width: 24,
    height: 24,
    paths: [
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px;`,
        d: 'M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z'
      },
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M7 12.5L10 15.5L17 8.5'
      }
    ]
  },
  square: {
    width: 24,
    height: 24,
    paths: [
      {
        style: `fill:transparent; stroke-width:${props.strokeWidth}px;`,
        d: 'M3 3H21V21H3V3Z'
      }
    ]
  }
}

const computedPaths = computed(() =>
  props.paths.length ? (props.paths as any as Path[]) : Icons[props.name].paths
)
const computedPolygons = computed(() =>
  props.polygons.length ? (props.polygons as Polygon[]) : Icons[props.name].polygons
)
const computedSvgViewbox = computed(() => {
  const { width, height } = Icons[props.name]
  return `0 0 ${width} ${height}`
})

const scaleValue = computed(() => {
  return typeof props.scale === 'string' ? parseFloat(props.scale) : props.scale
})
</script>

<style scoped>
svg {
  fill: currentColor;
}
</style>
