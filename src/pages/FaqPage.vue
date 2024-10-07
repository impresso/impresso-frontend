<template>
  <div id="faq-items" class="container py-5">
    <h1>{{ title }}</h1>
    <section v-for="(section, i) in sections" :key="i" class="my-5">
      <div class="row position-sticky top-0 bg-light z-index-1 border-bottom py-3">
        <h2 class="col-12 small-caps-bold m-0">{{ section.title }}</h2>
      </div>

      <div v-for="(paragraph, j) in section.paragraphs" :key="j" class="row mb-3">
        <a :id="paragraph.id" class="col-12" style="scroll-margin-top: 100px" />
        <div class="col-12">
          <h3 class="sans pt-4 font-size-inherit font-weight-bold">
            {{ paragraph.title }}
          </h3>
          <p v-html="paragraph.summary" />

          <ellipsis
            v-if="paragraph.description.length"
            class="p-3 rounded shadow"
            moreClass="rounded pr-1 pb-1"
            v-bind:initialHeight="70"
          >
            <div v-html="paragraph.description" />
          </ellipsis>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import content from '@/assets/faqpage.json'
import { mapStores } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { CollapsibleParagraph as Paragraph } from '@/models/CollapsibleParagraph'
import Ellipsis from '@/components/modules/Ellipsis.vue'

const ApiVersionLine = apiVersion => `
API: v${apiVersion.version},
Revision <a href="https://github.com/impresso/impresso-middle-layer/commit/${apiVersion.revision}" target="_blank">${apiVersion.revision}</a>,
"${apiVersion.branch}" branch.
`

const WebappVersionLine = `
Web App: v${import.meta.env.VITE_VERSION},
Revision <a href="https://github.com/impresso/impresso-frontend/commit/${import.meta.env.VITE_GIT_REVISION}" target="_blank">${import.meta.env.VITE_GIT_REVISION}</a>,
"${import.meta.env.VITE_GIT_BRANCH}" branch.
`

export default {
  components: {
    Ellipsis
  },
  computed: {
    ...mapStores(useSettingsStore),
    route: {
      get() {
        return this.$route
      }
    },
    title: {
      get() {
        return this.$t('title.faq')
      }
    },
    sections: {
      get() {
        const faqContent = content[this.activeLanguageCode]
        faqContent.groups.push(this.getVersionGroup())
        return faqContent.groups.map(g => {
          console.debug('[FaqPage] group:', g)
          return new Paragraph({
            id: g.title,
            title: g.title,
            paragraphs: g.faq.map(f => {
              console.debug('[FaqPage] paragraph:', f)
              return new Paragraph({
                id: f.id,
                title: f.title,
                summary: f.summary,
                description: f.description
              })
            })
          })
        })
      }
    },
    activeLanguageCode() {
      return this.settingsStore.language_code
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.route.hash) {
        const el = document.getElementById(this.route.hash.slice(1))
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', offset: { top: -100 } })
          // add actoive class tp the parent
          el.parentNode.classList.add('border-left', 'border-primary', 'pl-3')
        }
      }
    })
  },
  methods: {
    getVersionGroup() {
      return {
        title: this.$t('title.version'),
        faq: [
          {
            id: 'version-of-impresso',
            title: this.$t('title.whichVersion'),
            summary: this.$t('summary.version'),
            description: [WebappVersionLine, ApiVersionLine(window.impressoApiVersion)]
          }
        ]
      }
    }
  }
}
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
      transition: max-height 0.3 ease-in-out;
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
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
