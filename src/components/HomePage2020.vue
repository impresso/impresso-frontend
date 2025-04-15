<template>
  <i-layout id="HomePage2020" class="HomePage bg-dark">
    <i-layout-section
      class="HomePage__sidebar"
      :class="{ ' mr-1px border-top border-right': showLines, 'border-tertiary': darkMode }"
    >
      <!--  header -->
      <template v-slot:header>
        <div :class="{ 'border-bottom border-secondary': showLines }">
          <search-tabs focusOnSearch />
          <div class="py-3 px-3">
            <search-pills :filters="enrichedFilters" @changed="handleFiltersChanged" />
            <autocomplete @submitEmpty="onSubmitEmpty" v-on:submit="onSuggestion" />
          </div>
        </div>
      </template>

      <!--  body -->
      <div class="text-tertiary p-3 stats">
        <!-- <p>The impresso database is growing day-by-day. Currently there are </p> -->
        <p class="small-caps mt-3">Impresso data rundown</p>
        <p>
          <span class="number">76</span>
          newspapers, 2 countries<br />
          <span class="number"> 600,919</span>
          issues,<br />
          <span class="number">5,429,656</span>
          pages,<br />
          <span class="number">47,798,468</span>
          content items,<br />
          <span class="number"> 3,462,799</span>
          images,<br />
          <span class="number">12,493,358,703</span>
          tokens.<br />
        </p>

        <p>
          More? Check on our
          <a class="text-white" href="https://impresso-project.ch/blog">blog</a>
        </p>

        <div class="pl-3 my-3 border-left" style="border-width: 2px !important">
          <p>
            info @ impresso-project [dot] ch
            <br />
            project website: <a href="/" target="_blank">impresso-project.ch</a>
          </p>
          <!--  -->
          <p class="mb-0">
            <img
              src="@/assets/img/GitHub-Mark-Light-32px.png"
              alt="GitHub icon"
              class="mr-2"
              style="max-height: 16px"
            />
            github:
            <a :href="impressoInfo.project.repoUrl" target="_blank">
              {{ impressoInfo.project.repoUrlLabel }}</a
            >
          </p>
          <!-- mastodon -->
          <p class="mb-0">
            <img
              src="@/assets/img/Mastodon-logo-white.svg"
              class="mr-2"
              style="max-height: 16px"
              alt="Mastodon"
            />
            Mastodon: <a href="https://fedihum.org/@impresso" target="_blank">@impresso</a>
          </p>
          <!-- bsky -->
          <p class="mb-0">
            <img
              src="@/assets/img/Mastodon-logo-white.svg"
              class="mr-2"
              style="max-height: 16px"
              alt="Mastodon"
            />
            Bluesky:
            <a href="https://bsky.app/profile/impresso.bsky.social" target="_blank"
              >impresso.bsky.social</a
            >
          </p>
          <p>
            <Icon name="discord" class="text-white mr-2" :width="16" :stroke-width="2"></Icon>

            Discord:
            <a href="https://bsky.app/profile/impresso.bsky.social" target="_blank"
              >impresso.bsky.social</a
            >
          </p>
          <p>
            version:
            <a :href="impressoInfo.frontend.gitCommitUrl" target="_blank">
              {{ impressoInfo.frontend.version }}
            </a>
            <br />
            middle layer:
            <a :href="impressoInfo.middleLayer.gitCommitUrl" target="_blank">
              {{ impressoInfo.middleLayer.version }}
            </a>
          </p>
        </div>

        <br />
        <TermsOfUseStatus withCallToAction />
      </div>
    </i-layout-section>
    <i-layout-section>
      <div class="d-flex flex-wrap align-items-center">
        <section class="HomePage__card">
          <h1 class="HomePage__hugeHeading font-weight-medium display-3 mb-4">
            Media Monitoring <br />of the <span class="text-accent">Past</span>
          </h1>
          <h2>
            <em> Mining 200 years <br />of historical newspapers, and radio.</em>
          </h2>
        </section>
        <section
          v-if="!user"
          class="HomePage__card p-3 mb-3 mt-5 text-tertiary rounded enhance-contents position-relative shadow"
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
          <a
            class="btn btn-lg btn-primary border-primary rounded shadow-sm"
            href="https://impresso-project.ch/assets/documents/impresso_NDA.pdf"
            target="_self"
          >
            <div class="d-flex flex-row align-items-center">
              <div class="d-flex dripicons dripicons-download mr-2" />
              <div>{{ $t('download_nda') }}</div>
            </div>
          </a>
          <p class="mb-0 mt-3">
            ... and return the signed form to
            <a class="text-white" href="mailto:info@impresso-project.ch" target="_self">
              info@impresso-project.ch
            </a>
          </p>
        </section>

        <div class="HomePage__card">
          <h3>Learn Impresso with the Impresso Challenges</h3>
          <p>
            How to explore the newspapers with persons or locations? <br />What are topics good for?
            <br />What elements can be compared?
          </p>
          <a
            href="./../assets/impresso-challenges-1.2.3.pdf"
            target="_blank"
            class="btn btn-primary btn-lg rounded border"
          >
            <div class="d-flex flex-row w-100 align-items-center">
              <div class="d-flex dripicons dripicons-download mr-2" />
              <div class="small-caps">
                download challenges
                <b-badge pill variant="accent" class="ml-1">PDF</b-badge>
              </div>
            </div>
          </a>
        </div>
        <section class="HomePage__card">
          <h3>How can newspapers help understand the past? How to explore them?</h3>

          <p>Just a few examples to get you started!</p>
        </section>
        <Recipe
          v-for="recipe in computedRecipesWithQuery"
          class="HomePage__card"
          :key="recipe.caption"
          :query="recipe.query"
          :caption="recipe.caption"
          :text="recipe.text"
          :video="recipe.video"
          :img_src="recipe.img_src"
        />

        <h3 class="p-3 m-3 HomePage__card">
          Take a moment to familiarise yourself with <em>impresso</em>'s <b>advanced search</b> and
          <b> exploration workflows</b>
        </h3>
        <Recipe
          v-for="recipe in computedRecipesWithoutQuery"
          class="HomePage__card"
          :key="recipe.caption"
          :caption="recipe.caption"
          :text="recipe.text"
          :video="recipe.video"
          :img_src="recipe.img_src"
        />
      </div>
      <HomePageFooter />
    </i-layout-section>
  </i-layout>
</template>

<script>
import Autocomplete from './Autocomplete.vue'
import SearchTabs from './modules/SearchTabs.vue'
import SearchPills from '@/components/SearchPills.vue'
import TermsOfUseStatus from '@/components/TermsOfUseStatus.vue'
import HomePageFooter from './HomePageFooter.vue'
import Recipe from './Recipe.vue'
import { optimizeFilters, serializeFilters } from '@/logic/filters'
// import SearchQuery from '@/models/SearchQuery';
import content from '@/assets/homepage.json'
import { mapStores } from 'pinia'
import { useUserStore } from '@/stores/user'
import Icon from './base/Icon.vue'

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
  'daterange'
]

export default {
  data: () => ({
    impressoInfo: window.impressoInfo,
    recipes: content.recipes
  }),
  props: {
    showLines: {
      type: Boolean,
      default: false
    },
    darkMode: {
      type: Boolean,
      default: true
    },
    filters: {
      type: Array,
      default: () => []
    },
    filtersWithItems: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapStores(useUserStore),
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems.length
        ? this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
        : this.allowedFilters
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    allowedFilters() {
      // filter by type
      return this.filters.filter(({ type }) => AllowedFilterTypes.includes(type))
    },

    user() {
      return this.userStore.user
    },
    computedRecipesWithQuery() {
      return this.recipes.filter(recipe => recipe.query)
    },
    computedRecipesWithoutQuery() {
      return this.recipes.filter(recipe => !recipe.query)
    }
  },
  methods: {
    handleFiltersChanged(filters) {
      const sq = serializeFilters(optimizeFilters(filters).concat(this.ignoredFilters))
      this.$router.push({
        name: 'search',
        query: {
          sq
        }
      })
    },
    onSuggestion(filter) {
      console.info('on suggestion')
      this.handleFiltersChanged(this.filters.concat([filter]))
    },
    onSubmitEmpty() {
      this.handleFiltersChanged(this.filters)
    }
  },
  components: {
    Autocomplete,
    Icon,
    SearchTabs,
    HomePageFooter,
    SearchPills,
    Recipe,
    TermsOfUseStatus
  }
}
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

.HomePage__card {
  max-width: 420px;
  margin: var(--spacing-3);
  padding: var(--spacing-3);
}

.HomePage__sidebar {
  min-width: 400px;
}

.HomePage.bg-dark {
  color: var(--clr-grey-500);
}

.HomePage h3 {
  font-family: var(--bs-font-sans-serif);
  color: var(--clr-grey-700);
}

#HomePage2020.bg-dark {
  ul.nav.nav-pills .nav-item.active .nav-link {
    color: var(--clr-white);
    border-color: $clr-secondary;
    border-bottom-color: #343a40; // theme-color("dark")
  }

  .btn-primary,
  .input-group > .form-control,
  .input-group > .custom-select,
  .input-group > .custom-file {
    color: var(--clr-white);
    background-color: #343a40;
    border-color: var(--clr-white) !important;

    &::placeholder {
      color: var(--clr-white);
    }

    &:hover {
      background-color: var(--clr-dark);
    }
  }

  .btn-outline-primary {
    border-color: var(--clr-grey-500);
    color: var(--clr-grey-500);
    text-decoration: none;

    &:hover {
      color: var(--clr-white);
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
    color: var(--clr-white);

    &:hover {
      color: var(--impresso-color-yellow);
    }
  }

  a {
    color: var(--light);
  }
}

h1.HomePage__hugeHeading {
  line-height: 1.06em !important;
  text-decoration: underline;
  text-decoration-color: currentcolor;
  text-decoration-color: var(--impresso-color-yellow);
  font-size: calc(1.525rem + 3.3vw);
}

.stats span.number {
  color: #343a40;
}

.bg-dark {
  // h1.HomePage__hugeHeading {
  //   text-shadow: 1px 1px 1px #17191c;
  // }

  h1.HomePage__hugeHeading,
  h2 {
    color: var(--clr-white);
  }

  .stats span.number {
    color: var(--clr-white);
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

<i18n lang="json">
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
