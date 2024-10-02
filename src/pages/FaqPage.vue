<template>
  <div id="faq-items" class="container py-5">
    <div class="row justify-content-md-center">
      <h1>{{ title }}</h1>
      <div class="col col-xl-6 col-lg-8 col-md-10">
        <CollapsibleSection
          v-for="(section, idx) in sections"
          :key="section.id ?? idx"
          :paragraphs="section.paragraphs"
          :title="section.title"
          v-bind:isCollapsed="false"
        >
          <template v-slot:header>
            <div class="p-3">
              <h1 class="m-0">{{ section.title }}</h1>
              <p class="text-muted">{{ $t('summary.faq') }}</p>
            </div>
          </template>
        </CollapsibleSection>
      </div>
    </div>
  </div>
</template>

<script>
import content from '@/assets/faqpage.json'
import { mapStores } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import { CollapsibleParagraph } from '@/models/CollapsibleParagraph'

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
    CollapsibleSection
  },
  computed: {
    ...mapStores(useSettingsStore),
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
          return new CollapsibleParagraph({
            id: g.title,
            title: g.title,
            paragraphs: g.faq.map(f => {
              console.debug('[FaqPage] paragraph:', f)
              return new CollapsibleParagraph({
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
  methods: {
    toggleExpandGroup(groupIdx) {
      if (this.expandedGroupIdx === groupIdx) {
        this.expandedGroupIdx = -1
      } else {
        this.expandedGroupIdx = groupIdx
      }
    },
    toggleExpandSection(groupIdx, sectionIdx) {
      if (this.expandedGroupIdx === groupIdx && this.expandedSectionIdx === sectionIdx) {
        this.expandedSectionIdx = -1
      } else {
        this.expandedGroupIdx = groupIdx
        this.expandedSectionIdx = sectionIdx
      }
    },
    // toggleOpen(term) {
    //   if (this.isOpen(term)) {
    //     this.$router.push({ hash: '' })
    //   } else {
    //     this.$router.push({ hash: `#${term}` })
    //   }
    // },

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
      "version": "Version",
      "whichVersion": "Which version of Impresso am I using"
    },
    "summary": {
      "version": "Version of the web application and API. Use this to report issues."
    }
  }
}
</i18n>
