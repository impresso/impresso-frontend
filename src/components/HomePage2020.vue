<template>
  <i-layout
    id="HomePage2020"
    :class="{ 'pt-1px bg-light border-top': showLines, 'bg-dark border-tertiary': darkMode }"
  >
    <i-layout-section
      width="400px"
      :class="{ ' mr-1px border-top border-right': showLines, 'border-tertiary': darkMode }"
    >
      <!--  header -->
      <div slot="header" :class="{ 'border-bottom border-secondary': showLines }">
        <search-tabs focusOnSearch />
        <div class="py-3 px-3">
          <search-pills :filters="enrichedFilters" @changed="handleFiltersChanged" />
          <autocomplete @submitEmpty="onSubmitEmpty" v-on:submit="onSuggestion" />
        </div>
      </div>

      <!--  body -->
      <div class="text-tertiary p-3 stats">
        <!-- <p>The impresso database is growing day-by-day. Currently there are </p> -->
        <p class="small-caps mt-3">Impresso data rundown</p>
        <p>
          <span class="number">76</span>
          newspapers collected,<br />
          <span class="number"> 600,919</span>
          issues,<br />
          <span class="number">5,429,656</span>
          pages scanned,<br />
          <span class="number">47,798,468</span>
          content items identified,<br />
          <span class="number"> 3,462,799</span>
          images,<br />
          <span class="number">12,493,358,703</span>
          words.<br />
        </p>
        <p>
          <span class="number">2</span> countries of publication<br />
          <span class="number">530,086</span> named entities disambiguated
        </p>
        <p>
          More? Check on our
          <a
            class="text-white"
            href="https://impresso-project.ch/news/2020/01/23/state-corpus-january2020.html"
            >blog</a
          >
        </p>

        <div class="pl-3 my-3 border-left" style="border-width: 2px !important">
          <p>
            info @ impresso-project [dot] ch
            <br />
            project website: <a href="/" target="_blank">impresso-project.ch</a>
          </p>
          <br />
          <img
            src="@/assets/img/GitHub-Mark-Light-32px.png"
            alt="GitHub icon"
            class="mr-2"
            style="max-height: 1em"
          />
          github:
          <a :href="impressoInfo.project.repoUrl" target="_blank">
            {{ impressoInfo.project.repoUrlLabel }}</a
          >
          <p>
            <img
              src="@/assets/img/Twitter_Logo_WhiteOnImage.png"
              class="mr-2"
              style="max-height: 1em"
              alt="X (former witter) icon"
            />
            X (former witter):
            <a href="https://twitter.com/ImpressoProject" target="_blank">@impressoproject</a>
          </p>
          <p>
            version:
            <a :href="impressoInfo.frontend.gitCommitUrl" target="_blank">
              {{ impressoInfo.frontend.version }}</a
            >
            <br />
            middle layer:
            <a :href="impressoInfo.middleLayer.gitCommitUrl" target="_blank">
              {{ impressoInfo.middleLayer.version }}</a
            >
          </p>
        </div>

        <br />
      </div>
    </i-layout-section>
    <i-layout-section
      :class="{ ' ml-1px border-top border-left': showLines, 'border-tertiary': darkMode }"
    >
      <div class="container-fluid text-tertiary">
        <div class="row">
          <div class="col">
            <h1 class="huge m-4 my-2">
              Media Monitoring <br />of the <span class="text-accent">Past</span>
            </h1>
            <section
              v-if="!user"
              class="p-3 mb-3 mt-5 text-tertiary rounded enhance-contents position-relative shadow"
            >
              <div class="starburst-mask">
                <div class="starburst-wrapper">
                  <div class="position-absolute text">
                    Gain full Access for <b>free</b>!<br />
                    <div class="dripicons-jewel"></div>
                  </div>
                  <div class="position-absolute rotating">
                    <div class="starburst example" id="example-2"><span>&nbsp;</span></div>
                  </div>
                </div>
              </div>

              <p>
                For legal reasons not all content is available.
                <br />
                To gain access to the <b class="text-white">full impresso corpus</b> please
                <router-link class="text-white" :to="{ name: 'register' }">register</router-link>
                and sign our Non-Disclosure-Agreement.
              </p>
              <b-button
                :variant="darkMode ? 'primary' : 'outline-primary'"
                size="sm"
                href="https://impresso-project.ch/assets/documents/impresso_NDA.pdf"
                target="_self"
              >
                <div class="d-flex flex-row align-items-center">
                  <div class="d-flex dripicons dripicons-download mr-2" />
                  <div>{{ $t('download_nda') }}</div>
                </div>
              </b-button>
              <p class="mb-0 mt-3">
                ... and return the signed form to
                <a class="text-white" href="mailto:info@impresso-project.ch" target="_self"
                  >info@impresso-project.ch</a
                >
              </p>
            </section>

            <section class="mx-4">
              <h2>
                How can newspapers help understand the past? How to explore them?
              </h2>

              <p class="text-white my-5">
                Take a moment to familiarise yourself with <em>impresso</em>'s
                <b>advanced search</b> and <b> exploration workflows</b>
              </p>

              <b-container class="challenges my-4 enhance-contents border-0 p-0  shadow">
                <b-row class="p-0 rounded" style="overflow: hidden">
                  <b-col lg="6" md="12">
                    <img
                      src="./../assets/img/challenges-screenshot.png"
                      class="w-100 h-100"
                      style="object-fit: contain; object-position: center; border-start-start-radius: var(--border-radius-md);border-end-start-radius: var(--border-radius-md);opacity:.8"
                      alt="impresso challenges"
                    />
                  </b-col>
                  <b-col lg="6" md="12">
                    <div class="py-3 pr-3 ">
                      <h3 :class="{ 'text-white': darkMode }">
                        <i class="pb-3">Impresso Challenges</i>
                      </h3>
                      <p :class="{ 'text-white': darkMode }">
                        <b
                          >How to explore the newspapers with persons or locations? <br />What are
                          topics good for? <br />What elements can be compared?
                        </b>
                      </p>
                      <p>
                        Get a better understanding of this interfaces’ features and how they can
                        interact with 3 challenges, starting with an initiation and leading to an
                        expert level use of the interface.
                      </p>
                      <b-button
                        :variant="darkMode ? 'primary' : 'outline-primary'"
                        size="lg"
                        href="./../assets/impresso-challenges-1.2.3.pdf"
                        target="_blank"
                        class="rounded border-0"
                      >
                        <div class="d-flex flex-row align-items-center">
                          <div class="d-flex dripicons dripicons-download mr-2" />
                          <div class="small-caps">
                            download challenges
                            <b-badge pill variant="accent" class="ml-1">PDF</b-badge>
                          </div>
                        </div>
                      </b-button>
                    </div>
                  </b-col>
                </b-row>
              </b-container>
            </section>
          </div>
          <div class="col">
            <h2 class="text-white mt-5">
              Mining 200 years <br />of historical newspapers, and radio.
            </h2>
            <p class="text-white">
              Just a few examples to get you started!
            </p>
            <div class="d-flex flex-wrap">
              <Recipe
                v-for="recipe in recipes"
                class="m-3 p-3"
                :key="recipe.caption"
                :caption="recipe.caption"
                :text="recipe.text"
                :video="recipe.video"
                :img_src="recipe.img_src"
              />
            </div>
          </div>
        </div>
      </div>

      <home-page-footer />
    </i-layout-section>
  </i-layout>
</template>

<script>
import Autocomplete from './Autocomplete'
import SearchTabs from './modules/SearchTabs'
import SearchPills from '@/components/SearchPills'
import Recipes from './modules/homepage/Recipes'
import HomePageFooter from './HomePageFooter'
import InfoButton from './base/InfoButton'
import Recipe from './Recipe'
import { filtersItems as filtersItemsService } from '@/services'
import { searchQueryGetter, searchQueryHashGetter } from '@/logic/queryParams'
import { optimizeFilters, serializeFilters, joinFiltersWithItems } from '@/logic/filters'
import { getFilterQuery } from '../models/SearchQuery'
// import SearchQuery from '@/models/SearchQuery';
import content from '@/assets/homepage.json'

const AllowedFilterTypes = [
  'accessRight',
  'collection',
  'country',
  'isFront',
  'issue',
  'language',
  'location',
  'newspaper',
  'newspaper',
  'partner',
  'person',
  'string',
  'title',
  'topic',
  'type',
  'year',
  'daterange',
]

export default {
  data: () => ({
    /** @type {Filter[]} */
    filtersWithItems: [],
    impressoInfo: window.impressoInfo,
    recipes: content.recipes,
  }),
  props: {
    showLines: {
      type: Boolean,
      default: false,
    },
    darkMode: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    searchQuery: searchQueryGetter(),
    searchQueryHash: searchQueryHashGetter(),
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems.length
        ? this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
        : this.filters
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.searchQuery.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters.filter(({ type }) => AllowedFilterTypes.includes(type))
    },
    searchServiceQuery() {
      const query = {
        filters: this.filters.map(getFilterQuery),
      }
      return query
    },
    user() {
      return this.$store.getters['user/user']
    },
  },
  methods: {
    handleFiltersChanged(filters) {
      const sq = serializeFilters(optimizeFilters(filters).concat(this.ignoredFilters))
      this.$router.push({
        name: 'search',
        query: {
          sq,
        },
      })
    },
    onSuggestion(filter) {
      console.info('on suggestion')
      this.handleFiltersChanged(this.filters.concat([filter]))
    },
    onSubmitEmpty() {
      this.handleFiltersChanged(this.filters)
    },
  },
  watch: {
    searchServiceQuery: {
      handler({ filters }) {
        if (!filters.length) {
          return
        }
        filtersItemsService
          .find({
            query: {
              filters: this.searchQueryHash,
            },
          })
          .then(joinFiltersWithItems)
          .then(filtersWithItems => {
            this.filtersWithItems = filtersWithItems
          })
      },
      immediate: true,
    },
  },
  components: {
    Autocomplete,
    SearchTabs,
    Recipes,
    HomePageFooter,
    InfoButton,
    SearchPills,
    Recipe,
  },
}
</script>

<style lang="scss">
@import 'impresso-theme/src/scss/variables.sass';

#HomePage2020.bg-dark {
  ul.nav.nav-pills .nav-item.active .nav-link {
    color: $clr-white;
    border-color: $clr-secondary;
    border-bottom-color: #343a40; // theme-color("dark")
  }

  .btn-primary,
  .input-group > .form-control,
  .input-group > .custom-select,
  .input-group > .custom-file {
    color: $clr-white;
    background-color: #343a40;
    border-color: $clr-white !important;
    &::placeholder {
      color: $clr-white;
    }
    &:hover {
      background-color: black;
    }
  }
  .btn-outline-primary {
    border-color: #caccce;
    color: #caccce;
    text-decoration: none;
    &:hover {
      color: $clr-white;
    }
  }

  ul.nav.nav-pills {
    border-color: $clr-secondary;

    .nav-item .nav-link {
      color: #bec0c2;
    }
  }

  .search-pill span.label.sp-string,
  .search-pill span.label > .sp-string {
    color: black;
  }

  .stats a {
    color: $clr-white;
  }

  a {
    color: var(--light);
  }
}

h1.huge {
  font-size: 800%;
  line-height: 0.9;
}
.stats span.number {
  color: #343a40;
}

.bg-dark {
  h1.huge {
    text-shadow: 1px 1px 1px #17191c;
  }
  h1.huge,
  h2 {
    color: white;
  }
  .stats span.number {
    color: white;
  }

  &.border-tertiary,
  .border-tertiary {
    border-color: #ffffff47 !important;
  }
  .enhance-contents {
    background-color: #3e454c;
    font-size: 1em;
    border-left: 2px solid #f4d062;
  }
}

.arrow-down {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;

  border-top: 20px solid #fff;
}

.starburst {
  background-color: #eb5543;
  width: 6rem;
  height: 6rem;
  text-align: center;
  color: #fff;
  transform: rotate(-45deg);
  transition: background-color 0.5s ease-in-out;
}
.starburst,
.starburst span {
  display: flex;
  align-items: center;
  justify-content: center;
}

.starburst span {
  width: 100%;
  height: 100%;
  background: inherit;
  transform: rotate(45deg);
}

.starburst:before,
.starburst:after,
.starburst span:before,
.starburst span:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  z-index: -1;
  transform: rotate(30deg);
}

.starburst:after {
  transform: rotate(-30deg);
}

.starburst span:after {
  transform: rotate(30deg);
}
.starburst span:before {
  transform: rotate(-30deg);
}

.starburst-mask {
  position: absolute;
  top: -12rem;
  left: 5rem;
  margin-left: -6rem;
  height: 12rem;
  width: 12rem;
  overflow: hidden;
  background: transparent;

  .starburst-wrapper {
    pointer-events: none;
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    margin-left: -3rem;
    transition: transform 0.6s cubic-bezier(0.8, -0.5, 0.2, 1.4);
  }

  .starburst-wrapper .text {
    color: black;
    font-size: 1em;
    z-index: 1;
    font-variant: all-small-caps;
    width: 6rem;
    /* background: white; */
    height: 6rem;
    line-height: 1em;
    text-align: center;
    transform: rotate(-5deg);
    border-radius: 50%;
    padding-top: 1.15rem;
  }
  &:hover {
    .starburst-wrapper {
      transform: translateY(-5rem);
    }
    .starburst {
      background-color: #f4d062;
    }
  }
}
.enhance-contents:hover {
  .starburst-wrapper {
    transform: translateY(-5rem);
  }
  .starburst {
    background-color: #f4d062;
  }
}

@-webkit-keyframes rotating {
  // safari and chrome
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.rotating {
  animation: rotating 15s linear infinite;
}
</style>

<i18n>
{
  "en": {
    "toggle_lines_off": "lines: off",
    "toggle_lines_on": "lines: on",
    "toggle_darkmode_off": "dark mode: off",
    "toggle_darkmode_on": "dark mode: on",
    "download_nda": "download Non-Disclosure-Agreement form"
  }
}
</i18n>
