<template>
  <div id="faq-items" class="container py-5">
    <b-row class="justify-content-md-center">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="mb-4">{{faq.title}}</h1>
        <div v-for="(group, i) in faq.groups" v-bind:key="i" class="my-4">
          <h2 class="py-3"><i>{{group.title}}</i></h2>
          <div v-for="(term, j) in group.faq" v-bind:key="j" class="my-3">
            <a :id="`${term.id}`"></a>
            <div
              class="accordion-toggle"
              :class="{ collapsed: !isOpen(term.id), 'not-collapsed': isOpen(term.id) }"
              @click="toggleOpen(term.id)">
              <strong>{{term.title}}</strong>
            </div>
            <div class="faq-item pb-1">
              <div class="collapsable-container" :class="{ show: isOpen(term.id) }">
                <div class="summary my-1 p-3 bg-light border-left">{{term.summary}}</div>
                <p v-for="(paragraph, index) in term.description"  v-bind:key="index" v-html="paragraph" />
              </div>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>

</template>

<script>
import content from '@/assets/faqpage.json';
import { mapStores } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

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
  computed: {
    ...mapStores(useSettingsStore),
    faq: {
      get() {
        const faqContent = content[this.activeLanguageCode];
        faqContent.groups.push(this.getVersionGroup())
        return faqContent
      },
    },
    activeLanguageCode() {
      return this.settingsStore.language_code
    },
  },
  methods: {
    toggleOpen(term) {
      if (this.isOpen(term)) {
        this.$router.push({ hash: '' });
      } else {
        this.$router.push({ hash: `#${term}` });
      }
    },
    isOpen(term) {
      return this.$route.hash === `#${term}`;
    },
    getVersionGroup() {
      return {
        title: this.$t('title.version'),
        faq: [
          {
            id: 'version-of-impresso',
            title: this.$t('title.whichVersion'),
            summary: this.$t('summary.version'),
            description: [
              WebappVersionLine,
              ApiVersionLine(window.impressoApiVersion)
            ]
          }
        ]
      }
    }
  },
};
</script>

<style lang="scss">
  #faq-items{
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
        margin-left:-1em;
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
