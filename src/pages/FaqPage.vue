<template>
  <i-layout>
    <i-layout-section>
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item :to="{ name: 'faq' }" class="active" active-class="none">
              <span v-html="$t('tableOfContents')"></span>
            </b-nav-item>
          </template>
        </b-tabs>
      </template>
      <nav class="faq-toc mt-2">
        <ul class="list-unstyled">
          <li v-for="(section, i) in sections" :key="section.id">
            <p
              class="font-weight-bold d-block position-sticky top-0 bg-light z-index-1 border-bottom py-3 px-3 px-xl-4"
            >
              {{ section.title }}
            </p>
            <ul class="list-unstyled p-3 px-xl-4">
              <li class="mb-2" v-for="(paragraph, j) in section.paragraphs" :key="paragraph.id">
                <a :href="'#' + paragraph.id">
                  {{ paragraph.title }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </i-layout-section>
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar class="px-03 px-xl-5">
          <section class="pt-2 pb-1 w-100">
            <span class="label small-caps">{{ $t('help') }}</span>

            <h3 class="mb-1">
              {{ $t('title.faq') }}
            </h3>
          </section>
        </b-navbar>
      </template>
      <div id="faq-items" class="container ml-0 ms-0 px-3 px-xl-5">
        <section v-for="(section, i) in sections" :key="i" class="mbFre-5">
          <div class="row position-sticky top-0 bg-light z-index-1 border-bottom py-3">
            <h2 class="col-12 small-caps-bold m-0">{{ section.title }}</h2>
          </div>

          <div v-for="(paragraph, j) in section.paragraphs" :key="j" class="row mb-3">
            <a :id="paragraph.id" class="col-12" style="scroll-margin-top: 100px"></a>
            <div class="col-12">
              <h3 class="sans pt-4 font-size-inherit font-weight-bold">
                {{ paragraph.title }}
              </h3>
              <p v-html="paragraph.summary" />
              <div v-html="paragraph.description" />
            </div>
          </div>
        </section>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import content from '@/assets/faqpage.json'
import { useSettingsStore } from '@/stores/settings'
import { CollapsibleParagraph as Paragraph } from '@/models/CollapsibleParagraph'

// Types
interface FAQ {
  id: string
  title: string
  summary: string
  description: string | string[]
}

interface FAQGroup {
  title: string
  faq: FAQ[]
}

interface FAQContent {
  groups: FAQGroup[]
}

interface ApiVersion {
  version: string
  revision: string
  branch: string
}

// Composables
const route = useRoute()
const settingsStore = useSettingsStore()

// Helper functions
const ApiVersionLine = (apiVersion: ApiVersion): string => `
API: v${apiVersion.version},
Revision <a href="https://github.com/impresso/impresso-middle-layer/commit/${apiVersion.revision}" target="_blank">${apiVersion.revision}</a>,
"${apiVersion.branch}" branch.
`

const WebappVersionLine = (): string => `
Web App: v${import.meta.env.VITE_VERSION},
Revision <a href="https://github.com/impresso/impresso-frontend/commit/${import.meta.env.VITE_GIT_REVISION}" target="_blank">${import.meta.env.VITE_GIT_REVISION}</a>,
"${import.meta.env.VITE_GIT_BRANCH}" branch.
`

const activeLanguageCode = computed<string>(() => {
  return settingsStore.language_code
})
const getVersionGroup = (): FAQGroup => {
  return {
    title: 'title.version',
    faq: [
      {
        id: 'version-of-impresso',
        // It is not possible to use i18n in the title in setup apparently: https://github.com/intlify/vue-i18n/issues/953
        title: 'Which version of Impresso am I using?',
        summary: 'Version of the web application and API. Use this to report issues.',
        description: [WebappVersionLine(), ApiVersionLine((window as any).impressoApiVersion)]
      }
    ]
  }
}

const sections = computed(() => {
  const faqContent = (content as Record<string, FAQContent>)[activeLanguageCode.value]
  const groupsWithVersion = [...faqContent.groups, getVersionGroup()]

  return groupsWithVersion.map(g => {
    return new Paragraph({
      id: g.title,
      title: g.title,
      paragraphs: g.faq.map(f => {
        return new Paragraph({
          id: f.id,
          title: f.title,
          summary: f.summary,
          description: Array.isArray(f.description) ? f.description.join('<br/>') : f.description
        })
      })
    })
  })
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    if (route.hash) {
      const el = document.getElementById(route.hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  })
})
</script>

<style lang="scss">
#faq-items {
  img {
    max-width: 100%;
    zoom: 50%;
  }
  .accordion-toggle {
    cursor: n-resize;
    &.collapsed {
      cursor: s-resize;
      &::before {
        content: '+';
      }
    }
    &::before {
      content: '-';
      position: absolute;
      margin-left: -1em;
      font-size: 1.6em;
      line-height: 0.7;
      color: gray;
    }
  }
  .collapsable-container {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease-in-out;

    &.show {
      max-height: 1000px;
      transition: max-height 0.3s ease-in-out;
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "tableOfContents": "Table of Contents",
    "title": {
      "faq": "Frequently Asked Questions",
      "version": "Version",
      "whichVersion": "Which version of Impresso am I using"
    },
    "summary": {
      "version": "Version of the web application and API. Use this to report issues."
    }
  }
}
</i18n>
