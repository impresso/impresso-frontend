<template>
  <svg
    :width="width * scaleValue"
    :height="height * scaleValue"
    :viewBox="computedSvgViewbox"
    :class="{ Icon: true, ['Icon_' + name]: true }"
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
  width?: number
  height?: number
  paths: Path[]
  polygons?: Polygon[]
}

const coerceStyleType = (style: string | undefined): CSSProperties => {
  if (!style)
    return {
      strokeWidth: `${props.strokeWidth}px`,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'transparent'
    }
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
  arrowEnlargeTag: {
    paths: [
      {
        d: 'M8.5 9.5L6 12L8.5 14.5'
      },
      {
        d: 'M15.5 9.5L18 12L15.5 14.5'
      },
      {
        d: 'M2 15V9C2 6.79086 3.79086 5 6 5H18C20.2091 5 22 6.79086 22 9V15C22 17.2091 20.2091 19 18 19H6C3.79086 19 2 17.2091 2 15Z'
      }
    ]
  },
  sparks: {
    paths: [
      // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M8 15C12.8747 15 15 12.949 15 8C15 12.949 17.1104 15 22 15C17.1104 15 15 17.1104 15 22C15 17.1104 12.8747 15 8 15Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"></path><path d="M2 6.5C5.13376 6.5 6.5 5.18153 6.5 2C6.5 5.18153 7.85669 6.5 11 6.5C7.85669 6.5 6.5 7.85669 6.5 11C6.5 7.85669 5.13376 6.5 2 6.5Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"></path></svg>
      {
        d: 'M8 15C12.8747 15 15 12.949 15 8C15 12.949 17.1104 15 22 15C17.1104 15 15 17.1104 15 22C15 17.1104 12.8747 15 8 15Z'
      },
      {
        d: 'M2 6.5C5.13376 6.5 6.5 5.18153 6.5 2C6.5 5.18153 7.85669 6.5 11 6.5C7.85669 6.5 6.5 7.85669 6.5 11C6.5 7.85669 5.13376 6.5 2 6.5Z'
      }
    ]
  },
  bsky: {
    paths: [
      {
        d: 'M12 10.8c-1.087 -2.114 -4.046 -6.053 -6.798 -7.995C2.566 0.944 1.561 1.266 0.902 1.565 0.139 1.908 0 3.08 0 3.768c0 0.69 0.378 5.65 0.624 6.479 0.815 2.736 3.713 3.66 6.383 3.364 0.136 -0.02 0.275 -0.039 0.415 -0.056 -0.138 0.022 -0.276 0.04 -0.415 0.056 -3.912 0.58 -7.387 2.005 -2.83 7.078 5.013 5.19 6.87 -1.113 7.823 -4.308 0.953 3.195 2.05 9.271 7.733 4.308 4.267 -4.308 1.172 -6.498 -2.74 -7.078a8.741 8.741 0 0 1 -0.415 -0.056c0.14 0.017 0.279 0.036 0.415 0.056 2.67 0.297 5.568 -0.628 6.383 -3.364 0.246 -0.828 0.624 -5.79 0.624 -6.478 0 -0.69 -0.139 -1.861 -0.902 -2.206 -0.659 -0.298 -1.664 -0.62 -4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z',
        style: `fill:transparent;stroke-width:${props.strokeWidth}px;`
      }
    ]
  },
  soil: {
    paths: [
      {
        d: 'M2 4L22 4'
      },
      {
        d: 'M3 8.01L3.01 7.99889'
      },
      {
        d: 'M3 16.01L3.01 15.9989'
      },
      {
        d: 'M6 12.01L6.01 11.9989'
      },
      {
        d: 'M6 20.01L6.01 19.9989'
      },
      {
        d: 'M9 8.01L9.01 7.99889'
      },
      {
        d: 'M9 16.01L9.01 15.9989'
      },
      {
        d: 'M12 12.01L12.01 11.9989'
      },
      {
        d: 'M12 20.01L12.01 19.9989'
      },
      {
        d: 'M15 8.01L15.01 7.99889'
      },
      {
        d: 'M15 16.01L15.01 15.9989'
      },
      {
        d: 'M18 12.01L18.01 11.9989'
      },
      {
        d: 'M18 20.01L18.01 19.9989'
      },
      {
        d: 'M21 8.01L21.01 7.99889'
      },
      {
        d: 'M21 16.01L21.01 15.9989'
      }
    ]
  },
  codeBracketSquare: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" stroke-width="1.5" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M10 17L9.33334 17C8.22877 17 7.33334 16.1047 7.33334 15.0002C7.33334 14.3284 7.33334 13.6211 7.33333 13.1111C7.33333 12.5556 6 12 6 12C6 12 7.33333 11.4444 7.33334 10.8889C7.33334 10.4359 7.33334 9.70586 7.33334 8.99998C7.33334 7.89541 8.22877 7 9.33334 7L10 7" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14 17L14.6667 17C15.7712 17 16.6667 16.1047 16.6667 15.0002C16.6667 14.3284 16.6667 13.6211 16.6667 13.1111C16.6667 12.5556 18 12 18 12C18 12 16.6667 11.4444 16.6667 10.8889C16.6667 10.4359 16.6667 9.70586 16.6667 8.99998C16.6667 7.89541 15.7712 7 14.6667 7L14 7" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    paths: [
      {
        d: 'M7 2H3V22H7'
      },
      {
        d: 'M17 2H21V22H17'
      }
    ]
  },
  newsagency: {
    paths: [
      {
        d: 'M12 7L12 13'
      },
      {
        d: 'M4 21.4V2.6C4 2.26863 4.26863 2 4.6 2H19.4C19.7314 2 20 2.26863 20 2.6V21.4C20 21.7314 19.7314 22 19.4 22H4.6C4.26863 22 4 21.7314 4 21.4Z'
      },
      {
        d: 'M8 10H16M8 6H16M8 14H12M8 18H14'
      }
    ]
  },
  organisation: {
    paths: [
      {
        d: 'M3 21H21'
      },
      {
        d: 'M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21'
      },
      {
        d: 'M9 21V17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17V21'
      },
      {
        d: 'M9 8H15'
      },
      {
        d: 'M9 12H15'
      }
    ]
  },
  sourceType: {
    paths: [
      {
        d: 'M9 12H15'
      },
      {
        d: 'M12 9V15'
      },
      {
        d: 'M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z'
      }
    ]
  },
  sourceMedium: {
    paths: [
      {
        d: 'M22 12C22 15.3137 19.3137 18 16 18C14.3431 18 12.8414 17.3284 11.7712 16.2582C10.7009 15.1879 10.0294 13.6863 10.0294 12C10.0294 10.3137 10.7009 8.81214 11.7712 7.74184C12.8414 6.67154 14.3431 6 16 6C19.3137 6 22 8.68629 22 12Z'
      },
      {
        d: 'M14 12C14 15.3137 11.3137 18 8 18C4.68629 18 2 15.3137 2 12C2 8.68629 4.68629 6 8 6C11.3137 6 14 8.68629 14 12Z'
      }
    ]
  },
  //
  cubeDots: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M12.4961 19.7165L18.4961 16.2879C18.8077 16.1099 19 15.7785 19 15.4197V9.58032C19 9.22147 18.8077 8.89012 18.4961 8.71208L12.4961 5.28351C12.1887 5.10783 11.8113 5.10783 11.5039 5.28351L5.50386 8.71208C5.19229 8.89012 5 9.22147 5 9.58032V15.4197C5 15.7785 5.19229 16.1099 5.50386 16.2879L11.5039 19.7165C11.8113 19.8922 12.1887 19.8922 12.4961 19.7165Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.5 9.5L12 13M12 13L18.5 9.5M12 13V19.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 3.01013L3.01 2.99902" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 21.0101L3.01 20.999" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 3.01013L21.01 2.99902" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 21.0101L21.01 20.999" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    paths: [
      {
        d: 'M12.4961 19.7165L18.4961 16.2879C18.8077 16.1099 19 15.7785 19 15.4197V9.58032C19 9.22147 18.8077 8.89012 18.4961 8.71208L12.4961 5.28351C12.1887 5.10783 11.8113 5.10783 11.5039 5.28351L5.50386 8.71208C5.19229 8.89012 5 9.22147 5 9.58032V15.4197C5 15.7785 5.19229 16.1099 5.50386 16.2879L11.5039 19.7165C11.8113 19.8922 12.1887 19.8922 12.4961 19.7165Z'
      },
      {
        d: 'M5.5 9.5L12 13M12 13L18.5 9.5M12 13V19.5'
      },
      {
        d: 'M3 3.01013L3.01 2.99902'
      },
      {
        d: 'M3 21.0101L3.01 20.999'
      },
      {
        d: 'M21 3.01013L21.01 2.99902'
      },
      {
        d: 'M21 21.0101L21.01 20.999'
      }
    ]
  },
  dots: {
    paths: [
      {
        d: 'M3 3.01013L3.01 2.99902'
      },
      {
        d: 'M3 21.0101L3.01 20.999'
      },
      {
        d: 'M21 3.01013L21.01 2.99902'
      },
      {
        d: 'M21 21.0101L21.01 20.999'
      }
    ]
  },
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
    paths: [
      {
        style: `fill:transparent;stroke-width:${props.strokeWidth}px;stroke:currentColor`,
        d: 'M17 17L21 21'
      },
      {
        style: `fill:transparent;stroke-width:${props.strokeWidth}px;`,
        d: 'M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z'
      }
    ]
  },
  play: {
    paths: [
      {
        style: `fill:white;stroke-width:${props.strokeWidth}px;`,
        d: 'M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z'
      }
    ]
  },
  edit: {
    paths: [
      {
        d: 'M3 21L12 21H21'
      },
      {
        d: 'M12.2218 5.82839L15.0503 2.99996L20 7.94971L17.1716 10.7781M12.2218 5.82839L6.61522 11.435C6.42769 11.6225 6.32233 11.8769 6.32233 12.1421L6.32233 16.6776L10.8579 16.6776C11.1231 16.6776 11.3774 16.5723 11.565 16.3847L17.1716 10.7781M12.2218 5.82839L17.1716 10.7781'
      }
    ]
  },
  check: {
    paths: [
      {
        d: 'M20 6L9 17L4 12'
      }
    ]
  },
  checkCircle: {
    paths: [
      {
        d: 'M7 12.5L10 15.5L17 8.5'
      },
      {
        d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      }
    ]
  },
  checkSquareSolid: {
    paths: [
      {
        style: `fill:currentColor; stroke-width:${props.strokeWidth}px;`,
        d: 'M3.6 2.25C2.85442 2.25 2.25 2.85441 2.25 3.6V20.4C2.25 21.1456 2.85441 21.75 3.6 21.75H20.4C21.1456 21.75 21.75 21.1456 21.75 20.4V3.6C21.75 2.85442 21.1456 2.25 20.4 2.25H3.6ZM17.5303 9.03033C17.8232 8.73744 17.8232 8.26256 17.5303 7.96967C17.2374 7.67678 16.7626 7.67678 16.4697 7.96967L10 14.4393L7.53033 11.9697C7.23744 11.6768 6.76256 11.6768 6.46967 11.9697C6.17678 12.2626 6.17678 12.7374 6.46967 13.0303L9.46967 16.0303C9.76256 16.3232 10.2374 16.3232 10.5303 16.0303L17.5303 9.03033Z'
      }
    ]
  },
  circle: {
    paths: [
      {
        d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      }
    ]
  },
  chevron: {
    paths: [
      {
        style: `fill:transparent;stroke-width:${props.strokeWidth}px;`,
        d: 'M6 9L12 15L18 9'
      }
    ]
  },
  copy: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    paths: [
      {
        d: 'M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z'
      },
      {
        d: 'M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9'
      }
    ]
  },
  copyright: {
    paths: [
      {
        d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      },
      {
        d: 'M13.5 9.17071C13.1872 9.06015 12.8506 9 12.5 9C10.8431 9 9.5 10.3431 9.5 12C9.5 13.6569 10.8431 15 12.5 15C12.8506 15 13.1872 14.9398 13.5 14.8293'
      }
    ]
  },
  discord: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M5.5 16C10.5 18.5 13.5 18.5 18.5 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.5 17.5L16.5 19.5C16.5 19.5 20.6713 18.1717 22 16C22 15 22.5301 7.85339 19 5.5C17.5 4.5 15 4 15 4L14 6H12" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.52832 17.5L7.52832 19.5C7.52832 19.5 3.35699 18.1717 2.02832 16C2.02832 15 1.49823 7.85339 5.02832 5.5C6.52832 4.5 9.02832 4 9.02832 4L10.0283 6H12.0283" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.5 14C7.67157 14 7 13.1046 7 12C7 10.8954 7.67157 10 8.5 10C9.32843 10 10 10.8954 10 12C10 13.1046 9.32843 14 8.5 14Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.5 14C14.6716 14 14 13.1046 14 12C14 10.8954 14.6716 10 15.5 10C16.3284 10 17 10.8954 17 12C17 13.1046 16.3284 14 15.5 14Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    paths: [
      {
        d: 'M5.5 16C10.5 18.5 13.5 18.5 18.5 16'
      },
      {
        d: 'M15.5 17.5L16.5 19.5C16.5 19.5 20.6713 18.1717 22 16C22 15 22.5301 7.85339 19 5.5C17.5 4.5 15 4 15 4L14 6H12'
      },
      {
        d: 'M8.52832 17.5L7.52832 19.5C7.52832 19.5 3.35699 18.1717 2.02832 16C2.02832 15 1.49823 7.85339 5.02832 5.5C6.52832 4.5 9.02832 4 9.02832 4L10.0283 6H12.0283'
      },
      {
        d: 'M8.5 14C7.67157 14 7 13.1046 7 12C7 10.8954 7.67157 10 8.5 10C9.32843 10 10 10.8954 10 12C10 13.1046 9.32843 14 8.5 14Z'
      },
      {
        d: 'M15.5 14C14.6716 14 14 13.1046 14 12C14 10.8954 14.6716 10 15.5 10C16.3284 10 17 10.8954 17 12C17 13.1046 16.3284 14 15.5 14Z'
      }
    ]
  },
  linkedin: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 17V13.5V10" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 17V13.75M11 10V13.75M11 13.75C11 10 17 10 17 13.75V17" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 7.01L7.01 6.99889" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    paths: [
      {
        d: 'M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z'
      },
      {
        d: 'M7 17V13.5V10'
      },
      {
        d: 'M11 17V13.75M11 10V13.75M11 13.75C11 10 17 10 17 13.75V17'
      },
      {
        d: 'M7 7.01L7.01 6.99889'
      }
    ]
  },
  cross: {
    paths: [
      {
        d: 'M6 6L18 18'
      },
      {
        d: 'M6 18L18 6'
      }
    ]
  },
  key: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M10 12C10 14.2091 8.20914 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C8.20914 8 10 9.79086 10 12ZM10 12H22V15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 12V15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    paths: [
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M10 12C10 14.2091 8.20914 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C8.20914 8 10 9.79086 10 12ZM10 12H22V15'
      },
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M18 12V15'
      }
    ]
  },
  label: {
    paths: [
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linecap:round;`,
        d: 'M3 17.4V6.6C3 6.26863 3.26863 6 3.6 6H16.6789C16.8795 6 17.0668 6.10026 17.1781 6.26718L20.7781 11.6672C20.9125 11.8687 20.9125 12.1313 20.7781 12.3328L17.1781 17.7328C17.0668 17.8997 16.8795 18 16.6789 18H3.6C3.26863 18 3 17.7314 3 17.4Z'
      }
    ]
  },
  position: {
    paths: [
      {
        d: 'M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z'
      },
      {
        d: 'M12 19V21'
      },
      {
        d: 'M5 12H3'
      },
      {
        d: 'M12 5V3'
      },
      {
        d: 'M19 12H21'
      }
    ]
  },
  profileCircle: {
    paths: [
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z'
      },
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M4.271 18.3457C4.271 18.3457 6.50002 15.5 12 15.5C17.5 15.5 19.7291 18.3457 19.7291 18.3457'
      },
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z'
      }
    ]
  },
  text: {
    paths: [
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M19 7V5L5 5V7'
      },
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 5L12 19M12 19H10M12 19H14'
      }
    ]
  },
  textSquare: {
    // <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 9V7L17 7V9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 7V17M12 17H10M12 17H14" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    paths: [
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z'
      },
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M7 9V7L17 7V9'
      },
      {
        style: `stroke: currentColor; stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 7V17M12 17H10M12 17H14'
      }
    ]
  },
  warningTriangle: {
    paths: [
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linecap:round;`,
        d: 'M20.0429 21H3.95705C2.41902 21 1.45658 19.3364 2.22324 18.0031L10.2662 4.01533C11.0352 2.67792 12.9648 2.67791 13.7338 4.01532L21.7768 18.0031C22.5434 19.3364 21.581 21 20.0429 21Z'
      },
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linecap:round;`,
        d: 'M12 9V13'
      },
      {
        d: 'M12 17.01L12.01 16.9989'
      }
    ]
  },
  sendMail: {
    paths: [
      {
        d: 'M9 9L13.5 12L18 9'
      },
      {
        d: 'M3 13.5H5'
      },
      {
        d: 'M1 10.5H5'
      },
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linecap:round;`,
        d: 'M5 7.5V7C5 5.89543 5.89543 5 7 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H7C5.89543 19 5 18.1046 5 17V16.5'
      }
    ]
  },
  info: {
    paths: [
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;fill:transparent;`,
        d: 'M12 11.5V16.5'
      },
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;fill:transparent;`,
        d: 'M12 7.51L12.01 7.49889'
      },
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;fill:transparent;`,
        d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      }
    ]
  },
  language: {
    paths: [
      {
        d: 'M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12Z'
      },
      {
        d: 'M13 2.04932C13 2.04932 16 5.99994 16 11.9999C16 17.9999 13 21.9506 13 21.9506'
      },
      {
        d: 'M11 21.9506C11 21.9506 8 17.9999 8 11.9999C8 5.99994 11 2.04932 11 2.04932'
      },
      {
        d: 'M2.62964 15.5H21.3704'
      },
      {
        d: 'M2.62964 8.5H21.3704'
      }
    ]
  },
  checkSquare: {
    paths: [
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z'
      },
      {
        d: 'M7 12.5L10 15.5L17 8.5'
      }
    ]
  },
  square: {
    paths: [
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M3 3H21V21H3V3Z'
      }
    ]
  },
  textBox: {
    paths: [
      {
        d: 'M12 8L12 16M12 8H8M12 8H16'
      },
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linejoin:round;`,
        d: 'M21 13.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13.5M21 10.5V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V10.5'
      },
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linejoin:round;`,
        d: 'M19.5 13.5V10.5H22.5V13.5H19.5Z'
      },
      {
        style: `stroke-width:${props.strokeWidth}px; stroke-linejoin:round;`,
        d: 'M1.5 13.5V10.5H4.5V13.5H1.5Z'
      }
    ]
  },
  timer: {
    paths: [
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M9 2L15 2'
      },
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M12 10L12 14'
      },
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z'
      }
    ]
  },
  journal: {
    paths: [
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M6 6L18 6'
      },
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M6 10H18'
      },
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M13 14L18 14'
      },
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M13 18L18 18'
      },
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M2 21.4V2.6C2 2.26863 2.26863 2 2.6 2H21.4C21.7314 2 22 2.26863 22 2.6V21.4C22 21.7314 21.7314 22 21.4 22H2.6C2.26863 22 2 21.7314 2 21.4Z'
      },
      {
        style: `stroke-width:${props.strokeWidth}px;`,
        d: 'M6 18V14H9V18H6Z'
      }
    ]
  },
  warningCircle: {
    paths: [
      {
        style: ` stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 7L12 13'
      },
      {
        style: ` stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 17.01L12.01 16.9989'
      },
      {
        style: ` stroke-width:${props.strokeWidth}px; stroke-linecap:round; stroke-linejoin:round;`,
        d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      }
    ]
  },
  boxIso: {
    paths: [
      {
        style: `stroke-width:0px; stroke-linecap:round; stroke-linejoin:round;fill:currentColor;`,
        d: 'M2.6954 7.18536L11.6954 11.1854L12.3046 9.81464L3.3046 5.81464L2.6954 7.18536ZM12.75 21.5V10.5H11.25V21.5H12.75ZM12.3046 11.1854L21.3046 7.18536L20.6954 5.81464L11.6954 9.81464L12.3046 11.1854Z'
      },
      {
        d: 'M3 17.1101V6.88992C3 6.65281 3.13964 6.43794 3.35632 6.34164L11.7563 2.6083C11.9115 2.53935 12.0885 2.53935 12.2437 2.6083L20.6437 6.34164C20.8604 6.43794 21 6.65281 21 6.88992V17.1101C21 17.3472 20.8604 17.5621 20.6437 17.6584L12.2437 21.3917C12.0885 21.4606 11.9115 21.4606 11.7563 21.3917L3.35632 17.6584C3.13964 17.5621 3 17.3472 3 17.1101Z'
      },
      {
        d: 'M7.5 4.5L16.1437 8.34164C16.3604 8.43794 16.5 8.65281 16.5 8.88992V12.5'
      }
    ]
  }
}

const IconAliases: Record<string, string> = {
  title: 'textSquare',
  string: 'text',
  daterange: 'timer',
  year: 'timer',
  month: 'timer',
  newspaper: 'journal',
  type: 'label',
  country: 'position',
  person: 'cubeDots',
  nag: 'newsagency',
  newsagency: 'newsagency',
  organisation: 'organisation',
  sourceType: 'sourceType',
  sourceMedium: 'sourceMedium',
  collection: 'boxIso',
  embedding: 'codeBracketSquare'
}

const computedPaths = computed(() => {
  const icon = Icons[props.name] ?? Icons[IconAliases[props.name]]
  if (!icon) {
    console.warn(`Icon ${props.name} not found`)
    return []
  }
  if (!icon.paths) {
    return []
  }
  return props.paths.length ? (props.paths as Path[]) : icon.paths
})

const computedPolygons = computed(() => {
  const icon = Icons[props.name] ?? Icons[IconAliases[props.name]]
  if (!icon) {
    console.warn(`Icon ${props.name} not found`)
    return []
  }
  if (!icon.polygons) {
    return []
  }
  return props.polygons.length ? (props.polygons as Polygon[]) : icon.polygons
})

const computedSvgViewbox = computed(() => {
  const icon = Icons[props.name] ?? Icons[IconAliases[props.name]]
  if (!icon) {
    console.warn(`Icon ${props.name} not found`)
    return '0 0 24 24'
  }
  const { width, height } = icon
  return `0 0 ${width ?? 24} ${height ?? 24}`
})

const scaleValue = computed(() => {
  return typeof props.scale === 'string' ? parseFloat(props.scale) : props.scale
})
</script>

<style scoped>
svg {
  fill: currentColor;
}
svg path {
  fill: transparent;
  stroke: currentColor;
}
</style>
