<template lang="html">
  <header id="header" v-bind:class="{loading: showProgress}">
    <b-container fluid>
          <router-link :to="{name: 'home'}">
            <img src="./../assets/img/impresso-logo-h-i@2x.png" class="logo br" />
          </router-link>
          <!-- <router-link :to="{name: 'home'}" class="link bl br">{{$t("explore")}}</router-link> -->
          <div class="dropdown">
            <button class="dropbtn link">{{$t("explore")}}</button>
            <div class="dropdown-content">
              <a href="#" class="link bb">Link 1</a>
              <a href="#" class="link bb">Link 2</a>
              <a href="#" class="link">Link 3</a>
            </div>
          </div>
          <h1 class="text-serif">
            <span>La Gazette de Lausanne / <strong>Lundi 16 Mai 2018</strong></span></h1>

          <!-- {{$t("language")}} -->


          <!-- <b-dropdown right variant="link" :text="languages[activeLanguageCode].name">
            <b-dropdown-item
              v-for="language in languages"
              v-bind:active="activeLanguageCode === language.code"
              v-bind:key="language.code"
              @click.prevent="selectLanguage(language.code)"
              href="#">{{language.name}}</b-dropdown-item>
          </b-dropdown> -->
          <div style="float:right">

            <b-button v-show="!userData" v-bind:to="{name: 'login'}" variant="link">Login</b-button>

            <b-dropdown v-show="userData" right variant="link" :text="`${userData.username}`">
              <b-dropdown-item v-bind:to="{name: 'dashboard'}">Dashboard</b-dropdown-item>
              <b-dropdown-item v-on:click.prevent="logout">Logout</b-dropdown-item>
            </b-dropdown>

            <div class="dropdown">
              <button class="dropbtn link capital">{{languages[activeLanguageCode].code}}</button>
              <div class="dropdown-content right">
                <a
                  v-for="language in languages"
                  v-bind:active="activeLanguageCode === language.code"
                  v-bind:key="language.code"
                  @click.prevent="selectLanguage(language.code)"
                  href="#" class="link">{{language.name}}</a>
              </div>
            </div>
          </div>

    </b-container>
  </header>
</template>

<script>
export default {
  data: () => ({
    languages: {
      de: {
        code: 'de',
        name: 'Deutsch',
      },
      en: {
        code: 'en',
        name: 'English',
      },
      fr: {
        code: 'fr',
        name: 'Français',
      },
      it: {
        code: 'it',
        name: 'Italiano',
      },
      nl: {
        code: 'nl',
        name: 'Nederlands',
      },
    },
  }),
  computed: {
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    showProgress() {
      return this.$store.state.processing_status;
    },
    userData() {
      return this.$store.state.user.userData;
    },
  },
  methods: {
    selectLanguage(languageCode) {
      this.$i18n.locale = languageCode;
      this.$store.commit('settings/SET_LANGUAGE', {
        language_code: languageCode,
      });
    },
    logout() {
      this.$store.dispatch('user/LOGOUT').then(() => {
        this.$router.push('/');
      });
    },
  },
};
</script>

<style lang="less">
@import "./../assets/less/style.less";

header {
    //float: left;
    //display: flex;
    //align-items: center;
    //justify-content: center;
    background: @clr-black;
    background: linear-gradient(to top, #f0f0f0 2px, #000 2px, #000 100%);
    border-top: 2px solid @impresso-yellow;
    //border-bottom: 2px solid @clr-grey-100;
    border-bottom: 1px solid @clr-grey-400;
    //box-shadow: 0 1px 0 0 @clr-grey-400;
    position: fixed;
    width: 100%;

    transition: background-color 100ms;
    &.loading {
        border-bottom-color: @clr-yellow;
    }

    .logo {
        display: inline-block;
        height: 50px;
        padding: 10px 15px 10px 10px;
    }

    .link {
        // margin-right: 10px;
        // border-left: 1px solid @clr-grey-600;
        height: 100%;
        display: inline-block;
        padding: 15px;
        color: @clr-grey-400;
        font-size: 0.75rem;
        &.router-link-exact-active {
            // font-weight: bold;
            //background-color: @impresso-yellow;
            //color: black;
        }
        &:hover {
            // background: fade(@impresso-yellow, 30%); // rgba(000,100,100,0.2);
            text-decoration: none;
            color: @clr-white;
        }
    }
    h1 {
        position: absolute;
        z-index: -1;
        left: 50%;
        color: black;
        font-size: 1rem;
        top: 14px;
        width: 100%;
        text-align: center;
        margin-left: -50%;
        > span {
            background: white;
            padding: 2px 6px;
        }
    }

    .capital {
        text-transform: uppercase;
        font-weight: bold;
    }

    /* The dropdown container */
    .dropdown {
        overflow: hidden;
        display: unset;
        position: relative;
    }

    /* Dropdown button */
    .dropdown .dropbtn {
        background: transparent;
        border: 0;
        margin: inherit;
    }

    /* Dropdown content (hidden by default) */
    .dropdown-content {
        display: none;
        top: 31px;
        left: 0;
        position: absolute;
        background-color: black;
        min-width: 160px;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
        z-index: 1;
        &.right {
            left: inherit;
            right: 0;
        }
    }

    /* Links inside the dropdown */
    .dropdown-content a {
        float: none;
        display: block;
    }

    /* Add a grey background color to dropdown links on hover */
    .dropdown-content a:hover {
        //background-color: #ddd;
    }

    /* Show the dropdown menu on hover */
    .dropdown:hover .dropdown-content {
        display: block;
    }
}
</style>

<i18n>
{
  "en": {
    "explore": "Explore"
  },
  "fr": {
    "explore": "Découvrir"
  }
}
</i18n>
