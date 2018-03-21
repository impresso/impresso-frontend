<template>
<main id="HomePage">
  <div class="search_wrapper">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <SearchBar />
        </b-col>
      </b-row>
    </b-container>
  </div>
  <b-container>
    <b-row>
      <b-col>
        <h1>{{$t("welcome.title")}}</h1>
        <p>{{$t("welcome.body")}}</p>
      </b-col>
    </b-row>
    <thumbnail-slider v-model="sliderdata"></thumbnail-slider>
  </b-container>
</main>
</template>

<script>
import SearchBar from './SearchInputQueryWrapper';
import ThumbnailSlider from './modules/ThumbnailSlider';

export default {
  name: 'HelloWorld',
  data: () => ({
    sliderdata: {
      activePage: 1,
      pages: [{
        uid: 'GDL-1811-11-29-a-0001',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_1',
        num: 1,
      }, {
        uid: 'GDL-1811-11-29-a-0002',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_2',
        num: 2,
      }, {
        uid: 'GDL-1811-11-29-a-0003',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_3',
        num: 3,
      }, {
        uid: 'GDL-1811-11-29-a-0004',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_4',
        num: 4,
      }, {
        uid: 'GDL-1811-11-29-a-0001',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_1',
        num: 1,
      }, {
        uid: 'GDL-1811-11-29-a-0002',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_2',
        num: 2,
      }, {
        uid: 'GDL-1811-11-29-a-0003',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_3',
        num: 3,
      }, {
        uid: 'GDL-1811-11-29-a-0004',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_4',
        num: 4,
      }, {
        uid: 'GDL-1811-11-29-a-0001',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_1',
        num: 1,
      }, {
        uid: 'GDL-1811-11-29-a-0002',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_2',
        num: 2,
      }, {
        uid: 'GDL-1811-11-29-a-0003',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_3',
        num: 3,
      }, {
        uid: 'GDL-1811-11-29-a-0004',
        Project: 'impresso',
        iiif: 'http://dhlabsrv8.epfl.ch/iiif_letemps/GDL_1811_11_29_4',
        num: 4,
      }],
    },
  }),
  components: {
    SearchBar,
    ThumbnailSlider,
  },
};
</script>

<style scoped lang="less">
.search_wrapper {
    background: #d460ff;
    padding: 70px 0; margin-bottom: 50px;
  }
</style>

<i18n>
{
  "en": {
    "welcome": {
      "title": "Welcome",
      "body": "The language is English. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis auteirure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  },
  "fr": {
    "welcome": {
      "title": "Bonjour"
    }
  },
  "nl": {
    "welcome": {
      "title": "Welkom",
      "body": "De taal is Nederlands. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis auteirure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  }
}
</i18n>
