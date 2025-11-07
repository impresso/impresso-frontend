<template lang="html">
  <div class="wikidata-block bg-dark p-2">
    <div class="wikidata-head d-flex mb-2 align-items-center">
      <div class="images mr-2" v-if="preferredImage">
        <div class="image" :style="imageStyle(preferredImage)" />
      </div>
      <div class="labels" v-if="item.wikidata">
        <strong>{{ title }}</strong> ({{ item.wikidata.id }})
        <br />
        <span class="small-caps">{{ $t(`types.${item.wikidata.type}`) }}</span>
        <span v-if="item.wikidata.type === 'location'">
          <a :href="geographicUrl" taget="_blank">{{ geoCoordinates }}</a>
        </span>
        <a
          v-if="item.wikidata.birthPlace"
          :href="`https://www.wikidata.org/wiki/${item.wikidata.birthPlace.id}`"
          target="_blank"
        >
          {{ getTranslation(item.wikidata.birthPlace.labels) }},</a
        >
        <span v-if="item.wikidata.birthDate"> {{ parseWkDate(item.wikidata.birthDate) }} - </span>
        <a
          v-if="item.wikidata.deathPlace"
          :href="`https://www.wikidata.org/wiki/${item.wikidata.deathPlace.id}`"
          target="_blank"
        >
          {{ getTranslation(item.wikidata.deathPlace.labels) }},</a
        >
        <span v-if="item.wikidata.deathDate">
          {{ parseWkDate(item.wikidata.deathDate) }}
        </span>
      </div>
    </div>
    <!--  description or other contents here -->
    <div class="wikidata-contents" v-if="item.wikidata?.descriptions">
      <span class="text-serif px-1 mr-1 white border">W</span>
      <em>{{ description }}</em>
      <br />
      <a
        class="small-caps"
        :href="`https://www.wikidata.org/wiki/${item.wikidata.id}`"
        target="_blank"
      >
        <span v-html="$t('source.wikidata', { id: item.wikidata.id })" />
      </a>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    thumbnailSize: {
      type: Number,
      default: 80
    }
  },
  computed: {
    ...mapStores(useSettingsStore),
    geoCoordinates() {
      return [
        this.$n(parseInt(this.item.wikidata.coordinates.latitude * 100000, 10) / 100000),
        'N',
        ', ',
        this.$n(parseInt(this.item.wikidata.coordinates.longitude * 100000, 10) / 100000),
        'W'
      ].join('')
    },
    geographicUrl() {
      const coords = this.item.wikidata.coordinates
      const bbox = `${coords.longitude - 2},${coords.latitude - 1},${coords.longitude + 2},${coords.latitude + 1}`
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${this.item.wikidata.coordinates.latitude},${this.item.wikidata.coordinates.longitude}`
    },
    preferredImage() {
      if (this.item?.wikidata?.images) {
        for (let i = 0, l = this.item.wikidata.images.length; i < l; i += 1) {
          if (this.item.wikidata.images[i].rank === 'preferred') {
            return this.item.wikidata.images[i]
          }
        }
        return this.item.wikidata.images[0]
      }
      return null
    },
    currentLanguage() {
      return this.settingsStore.language_code
    },
    description() {
      return this.getTranslation(this.item.wikidata.descriptions)
    },
    title() {
      return this.getTranslation(this.item.wikidata?.labels)
    }
  },
  methods: {
    imageStyle(image) {
      console.info('image')
      return {
        backgroundImage: `url("${this.getWikimediaUrl(image)}")`,
        height: `${this.thumbnailSize}px`,
        width: `${this.thumbnailSize}px`,
        borderRadius: `${this.thumbnailSize}px`,
        backgroundSize: 'cover'
      }
    },
    getWikimediaUrl(image) {
      return `http://commons.wikimedia.org/wiki/Special:FilePath/${image.value}?width=${this.thumbnailSize}px`
    },
    getTranslation(translatable) {
      if (typeof translatable !== 'object') {
        return ''
      }
      const value = translatable[this.currentLanguage]
      if (value) {
        return value
      }
      // if there isn't any tranlation avaialble in current language, switch to the first language
      const languages = Object.keys(translatable)
      if (languages.length) {
        return translatable[languages.shift()]
      }
      return ''
    },
    parseWkDate(wkDate) {
      console.info('parseWkDate', wkDate)
      let numYear = parseInt(wkDate.split('-')[0], 10)
      // console.info(numYear);
      if (isNaN(numYear)) {
        numYear = parseInt(wkDate.split('-')[1], 10) * -1
        // console.info(numYear);
      }
      return numYear
    }
  }
}
</script>

<style lang="scss" scoped>
.wikidata-block {
  .contents {
    flex-grow: 1;
  }
  .image {
    border: 1px solid;
  }
  &.bg-dark {
    color: #d8d8d8;
  }
  &.bg-dark strong {
    color: white;
  }
  &.bg-dark a {
    color: white;
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "source": {
      "wikidata": "source: wikidata <span class='text-serif'>W</span>/{id}"
    }
  }
}
</i18n>
