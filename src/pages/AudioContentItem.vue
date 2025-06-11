<template>
  <i-layout class="AudioContentItem">
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="px-3 pt-3 flex-grow-1 border-right">
            <PageHeading :label="$t('label_group')" :title="$t('pages.searchRadio')"></PageHeading>
          </b-navbar-nav>
        </b-navbar>
      </template>
      <div class="container">
        blabla {{ isLoading }}
        <AudioItem
          v-if="fetchAudioItemResponse.data"
          :item="fetchAudioItemResponse.data"
          :is-loading="isLoading"
        ></AudioItem>
        <AudioPlayer :src="itemAudioSrc" :is-loading="isLoading"></AudioPlayer>
        <!-- <TranscriptViewer
        v-if="fetchAudioItem"
        :transcript="rrrebs"
        ></TranscriptViewer>-->
      </div>
    </i-layout-section>
  </i-layout>
</template>
<i18n lang="json">
{
  "en": {
    "pages": {
      "searchRadio": "Search Radio"
    },
    "label_group": "Audio Content Item"
  }
}
</i18n>
<script setup lang="ts">
import PageHeading from '@/components/base/PageHeading.vue'
import type { AudioContentItem } from '@/models'
import AudioItem from 'impresso-ui-components/components/AudioItem.vue'
import AudioPlayer from 'impresso-ui-components/components/audioPlayer/AudioPlayer.vue'
import TranscriptViewer from 'impresso-ui-components/components/audioPlayer/TranscriptViewer.vue'
import { watch } from 'vue'
import { computed, ref } from 'vue'

const itemUrl = computed(() => {
  // CFCE-1996-09-08-a-i0001
  return 'https://gist.githubusercontent.com/danieleguido/d3e76a1f8f3ba494f3da367b8349271a/raw/1f065b964d243e38a16f4f20a649a9709c130799/CFCE-1996-09-08-a-i0001.json'
})
const itemAudioSrc = computed(() => {
  return 'https://gilberttrausch.uni.lu/audio/ch3-3fkl01junckertrauschbechdupong.mp3'
})
const fetchAudioItemResponse = ref<{
  status: 'loading' | 'success' | 'error'
  data: AudioContentItem | null
}>({
  status: 'loading',
  data: null
})

const isLoading = computed(() => fetchAudioItemResponse.value?.status === 'loading')

function fetchAudioItem(): void {
  fetch(itemUrl.value)
    .then(response => response.json())
    .then((data: AudioContentItem) => {
      fetchAudioItemResponse.value = {
        status: 'success',
        data
      }
    })
    .catch(error => {
      console.error('Error fetching audio item:', error)
      fetchAudioItemResponse.value = {
        status: 'error',
        data: null
      }
    })
}

import { useRoute } from 'vue-router'

const route = useRoute()

watch(
  () => route.params.content_item_uid,
  (newId, oldId) => {
    // react to route changes...
    if (newId !== oldId) {
      console.debug('[AudioContentItem] Route changed, fetching new audio item...')
      fetchAudioItem()
    }
  },
  { immediate: true }
)

const rrrebs = ref([
  {
    text: 'La ronde des nations,',
    startTime: 0,
    endTime: 4
  },
  {
    text: 'revue hebdomadaire de la coopération internationale,',
    startTime: 4,
    endTime: 10
  },
  {
    text: 'réalisée et présentée par Fabrice Lamart.',
    startTime: 10,
    endTime: 16
  },
  {
    text: 'Les accords économiques internationaux sont dans certains domaines indispensables pour',
    startTime: 31,
    endTime: 39.75
  },
  {
    text: "établir les fondations d'une construction européenne.",
    startTime: 39.75,
    endTime: 45
  },
  {
    text: "Dans d'autres, au contraire,",
    startTime: 45,
    endTime: 46.6
  },
  {
    text: "on n'a pas trouvé de difficultés essentielles et la répartition",
    startTime: 46.6,
    endTime: 50.6
  },
  {
    text: "s'est faite en quelque sorte d'elle-même.",
    startTime: 50.6,
    endTime: 53
  },
  {
    text: "N'est-ce pas le cas du charbon européen ? Comment se",
    startTime: 53,
    endTime: 56.461
  },
  {
    text: "pose aujourd'hui le problème du charbon ? Quelles sont les",
    startTime: 56.461,
    endTime: 59.922
  },
  {
    text: "perspectives pour un avenir prochain ? C'est ce que nous",
    startTime: 59.923,
    endTime: 63.11
  },
  {
    text: 'allons demander à trois économistes groupés autour du micro de',
    startTime: 63.111,
    endTime: 65.888
  },
  {
    text: 'la ronde des nations,',
    startTime: 65.888,
    endTime: 67
  },
  {
    text: 'Paul Devina, député ancien ministre,',
    startTime: 67,
    endTime: 69.812
  },
  {
    text: 'Jacques Gascuel, directeur de perspectives et Émile Servan-Schreiber,',
    startTime: 69.812,
    endTime: 74.312
  },
  {
    text: 'directeur des échos. Émile Servan-Schreiber,',
    startTime: 74.312,
    endTime: 76.63
  },
  {
    text: "je crois que vous pourriez d'abord nous donner quelques chiffres",
    startTime: 76.631,
    endTime: 79.788
  },
  {
    text: 'et poser en quelque sorte le problème.',
    startTime: 79.789,
    endTime: 82
  },
  {
    text: 'Je réponds volontiers à votre désir,',
    startTime: 83,
    endTime: 85.4
  },
  {
    text: 'encore que les statistiques en général sont fortes ennuyeuses.',
    startTime: 85.4,
    endTime: 89
  },
  {
    text: "Nous sommes certains qu'elles seront brèves.",
    startTime: 89,
    endTime: 91
  },
  {
    text: 'Aussi, je les prie aussi brèves que possible.',
    startTime: 91,
    endTime: 93
  },
  {
    text: "L'OCE, l'organisation européenne de coopération économique,",
    startTime: 93,
    endTime: 96.517
  },
  {
    text: "a publié un rapport disant qu'en 52-53 l'Europe pourrait produire",
    startTime: 96.517,
    endTime: 102.379
  },
  {
    text: '511 millions de tonnes de charbon,',
    startTime: 102.379,
    endTime: 105.896
  },
  {
    text: 'ce qui sera une production légèrement excédentaire.',
    startTime: 105.896,
    endTime: 110
  },
  {
    text: "Comment nous trouvons-nous aujourd'hui par rapport à ce projet futur",
    startTime: 110,
    endTime: 114.544
  },
  {
    text: '? Eh bien, si on prend la production du mois',
    startTime: 114.545,
    endTime: 117.902
  },
  {
    text: 'de septembre, chiffre fourni par le Comité européen du charbon,',
    startTime: 117.903,
    endTime: 121.128
  },
  {
    text: 'on trouve en gros,',
    startTime: 121.129,
    endTime: 122.418
  },
  {
    text: 'bien entendu, un chiffre tout à fait rond.',
    startTime: 122.419,
    endTime: 125
  },
  {
    text: 'Grande-Bretagne pour un seul mois.',
    startTime: 125,
    endTime: 127
  },
  {
    text: 'Grande-Bretagne, 18. Roux, Rexton-Chapel,',
    startTime: 127,
    endTime: 130.142
  },
  {
    text: 'par conséquent Allemagne occidentale,',
    startTime: 130.142,
    endTime: 132.428
  },
  {
    text: '8. Pologne, 6. France,',
    startTime: 132.428,
    endTime: 136
  },
  {
    text: "4. Saar, un peu plus d'un.",
    startTime: 136,
    endTime: 139
  },
  {
    text: 'Belgique, 2. Tchécoslovaquie, 1 et quelque chose.',
    startTime: 139,
    endTime: 142
  },
  {
    text: 'Hollande, 1. Si vous additionnez,',
    startTime: 142,
    endTime: 145.20000000000002
  },
  {
    text: 'vous constaterez, nous ne prône pas la multiplication ici,',
    startTime: 145.2,
    endTime: 148.799
  },
  {
    text: "qu'on arrive à un peu moins des 511 millions prévus",
    startTime: 148.8,
    endTime: 152.799
  },
  {
    text: "pour l'année 53. Donc on manque encore de charbon.",
    startTime: 152.8,
    endTime: 156
  },
  {
    text: "Mais on ne peut pas dire qu'on manque de charbon",
    startTime: 156,
    endTime: 158.726
  },
  {
    text: "actuellement. Au contraire, on a déjà l'impression qu'on en a",
    startTime: 158.727,
    endTime: 161.04500000000002
  },
  {
    text: 'plutôt trop par rapport à la consommation actuelle.',
    startTime: 161.045,
    endTime: 162.863
  },
  {
    text: "C'est bien votre avis ? Tout à fait.",
    startTime: 162.863,
    endTime: 165
  },
  {
    text: 'Ce qui est même très curieux en ce moment-ci,',
    startTime: 165,
    endTime: 166.894
  },
  {
    text: "c'est de constater que le problème du charbon,",
    startTime: 166.894,
    endTime: 168.578
  },
  {
    text: 'qui était si aigu il y a deux ans et',
    startTime: 168.578,
    endTime: 170.68300000000002
  },
  {
    text: "qui avait attiré l'attention des pouvoirs publics de tous les",
    startTime: 170.684,
    endTime: 172.788
  },
  {
    text: "pays, qui nous a valu d'ailleurs l'aide américaine pour partie,",
    startTime: 172.789,
    endTime: 176.12900000000002
  },
  {
    text: "car l'affaire du charbon était capitale,",
    startTime: 176.13,
    endTime: 178.216
  },
  {
    text: "aussi importante, plus importante que l'affaire du blé.",
    startTime: 178.217,
    endTime: 181
  },
  {
    text: 'Au moment où les charbonnages européens ne produisaient pas suffisamment,',
    startTime: 181,
    endTime: 183.5
  },
  {
    text: "n'avaient pas été remis en état.",
    startTime: 183.5,
    endTime: 185
  },
  {
    text: "Mais nous avons d'autre part une telle révolution dans la",
    startTime: 185,
    endTime: 188.927
  },
  {
    text: 'technique de la production et en Angleterre depuis la nationalisation',
    startTime: 188.928,
    endTime: 192.856
  },
  {
    text: "et en France depuis les grands travaux d'équipement que nous",
    startTime: 192.857,
    endTime: 196.57
  },
  {
    text: 'sommes arrivés au point,',
    startTime: 196.571,
    endTime: 197.713
  },
  {
    text: 'non pas de saturation,',
    startTime: 197.714,
    endTime: 198.856
  },
  {
    text: "mais où le problème n'a plus l'aspect du tout d'un",
    startTime: 198.857,
    endTime: 201.713
  },
  {
    text: 'danger. Si au point de vue de la production,',
    startTime: 201.714,
    endTime: 205
  },
  {
    text: "le problème de l'approvisionnement en charbon est réglé,",
    startTime: 205,
    endTime: 208
  },
  {
    text: "il n'en demeure pas moins qu'il y a un problème",
    startTime: 209,
    endTime: 211.607
  },
  {
    text: 'qui se pose et qui soulève de nouveau celui de',
    startTime: 211.608,
    endTime: 214.21599999999998
  },
  {
    text: "la conclusion d'entente. C'est le problème des prix.",
    startTime: 214.217,
    endTime: 217
  },
  {
    text: 'Nous en avons déjà parlé à la séance précédente et',
    startTime: 217,
    endTime: 220.808
  },
  {
    text: "c'est un problème extrêmement important qui résulte du cloisonnement de",
    startTime: 220.809,
    endTime: 224.618
  },
  {
    text: "l'Europe et qui a pour conséquence que nos prix de",
    startTime: 224.619,
    endTime: 227.88
  },
  {
    text: "revient n'ont pas de charbon seulement,",
    startTime: 227.88,
    endTime: 229.79999999999998
  },
  {
    text: "mais également des produits que l'on fabrique avec le charbon,",
    startTime: 229.8,
    endTime: 233
  },
  {
    text: "c'est-à-dire avec l'acier, ne sont plus,",
    startTime: 233,
    endTime: 234.893
  },
  {
    text: 'comme disent les Allemands,',
    startTime: 234.894,
    endTime: 236.157
  },
  {
    text: "concurrents faits, c'est-à-dire ne peuvent plus soutenir la production.",
    startTime: 236.157,
    endTime: 239
  },
  {
    text: "Parce que chacun, lorsque son voisin s'adresse à lui pour",
    startTime: 239,
    endTime: 242.213
  },
  {
    text: "lui vendre du charbon et qu'il en a trop,",
    startTime: 242.214,
    endTime: 245.106
  },
  {
    text: "le lui vend beaucoup plus cher qu'il ne devrait et",
    startTime: 245.107,
    endTime: 248.307
  },
  {
    text: "qu'il ne revient à ses propres producteurs d'acier ou de",
    startTime: 248.307,
    endTime: 251.38299999999998
  },
  {
    text: "produits chimiques. Là, c'est très exact.",
    startTime: 251.384,
    endTime: 253.066
  },
  {
    text: 'Le danger existe et il peut même devenir un danger',
    startTime: 253.066,
    endTime: 255.732
  },
  {
    text: 'politique. Je vous rends attentif,',
    startTime: 255.733,
    endTime: 258.23
  },
  {
    text: "d'ailleurs nous le sommes tous,",
    startTime: 258.23,
    endTime: 259.76800000000003
  },
  {
    text: 'au fait que ce qui a déterminé la philosophie pratique',
    startTime: 259.769,
    endTime: 262.845
  },
  {
    text: 'et politique du fascisme avant la guerre,',
    startTime: 262.846,
    endTime: 265
  },
  {
    text: 'ça a été la révendication des pays qui se disaient',
    startTime: 265,
    endTime: 267.79999999999995
  },
  {
    text: "pauvres à l'égard des pays qui se disaient riches,",
    startTime: 267.8,
    endTime: 270.32
  },
  {
    text: 'en quoi ? En matière première.',
    startTime: 270.32,
    endTime: 272
  },
  {
    text: "Et le même grief d'exploitation des pays qui n'avaient pas",
    startTime: 272,
    endTime: 275.225
  },
  {
    text: 'les moyens de se progresser en matière première a été',
    startTime: 275.225,
    endTime: 278.451
  },
  {
    text: 'fait et de là sont venues les revendications fascistes,',
    startTime: 278.451,
    endTime: 281.354
  },
  {
    text: 'nazis, etc. Donc, une sorte de crime,',
    startTime: 281.354,
    endTime: 283.66600000000005
  },
  {
    text: 'si je puis dire,',
    startTime: 283.666,
    endTime: 284.999
  },
  {
    text: "contre l'unité européenne. En somme,",
    startTime: 285,
    endTime: 288.66600000000005
  },
  {
    text: 'la situation est telle que la question de prix mise',
    startTime: 288.666,
    endTime: 291.999
  },
  {
    text: "à part, c'est-à-dire au fond la question du pouvoir d'achat,",
    startTime: 292,
    endTime: 295.333
  },
  {
    text: "comme d'habitude, il y a beaucoup de charbon en Europe",
    startTime: 295.333,
    endTime: 298.132
  },
  {
    text: 'et il y en aura bientôt trop.',
    startTime: 298.133,
    endTime: 300
  },
  {
    text: "La même situation se révèle pour l'acier.",
    startTime: 300,
    endTime: 301.999
  },
  {
    text: 'Vous savez que nous venons de recevoir de Genève,',
    startTime: 302,
    endTime: 304.57000000000005
  },
  {
    text: 'de la Commission économique européenne,',
    startTime: 304.571,
    endTime: 306
  },
  {
    text: "un rapport qui indique qu'en 1953,",
    startTime: 306,
    endTime: 308.14200000000005
  },
  {
    text: 'il y aura également 8 millions de tonnes excédentaires en',
    startTime: 308.142,
    endTime: 311.71400000000006
  },
  {
    text: "acier, alors que l'Amérique,",
    startTime: 311.714,
    endTime: 313.14200000000005
  },
  {
    text: "depuis 1937, a pratiquement doublé sa production d'acier.",
    startTime: 313.142,
    endTime: 316
  },
  {
    text: 'Si les programmes sont respectés partout en Europe,',
    startTime: 316,
    endTime: 318.285
  },
  {
    text: "est-il certain qu'ils seront respectés ? Il y a quelques",
    startTime: 318.285,
    endTime: 321.817
  },
  {
    text: "chances, mais je voudrais attirer l'attention de nos collègues et",
    startTime: 321.818,
    endTime: 326.363
  },
  {
    text: 'nos auditeurs sur la définition du mot trop.',
    startTime: 326.363,
    endTime: 330
  },
  {
    text: "Que faut-il entendre par trop d'acier,",
    startTime: 330,
    endTime: 331.845
  },
  {
    text: "trop de charbon ? C'est assez curieux.",
    startTime: 331.846,
    endTime: 334
  },
  {
    text: 'La production et les besoins,',
    startTime: 334,
    endTime: 335.66600000000005
  },
  {
    text: 'mais les besoins changent.',
    startTime: 335.666,
    endTime: 337
  },
  {
    text: 'Mais les besoins changent et les besoins actuels ne sont',
    startTime: 337,
    endTime: 340.333
  },
  {
    text: 'pas satisfaits. Les besoins me paraissent absolument illimités.',
    startTime: 340.333,
    endTime: 342.999
  },
  {
    text: "C'est l'argent qui n'est pas là,",
    startTime: 343,
    endTime: 344.999
  },
  {
    text: 'mais les besoins sont absolument illimités.',
    startTime: 345,
    endTime: 347
  },
  {
    text: 'Il est vraiment curieux,',
    startTime: 347,
    endTime: 347.922
  },
  {
    text: "d'ailleurs c'est tout le problème de la question du problème",
    startTime: 347.923,
    endTime: 350.23
  },
  {
    text: "de l'abondance, il est vraiment curieux que nous fassions tant",
    startTime: 350.23,
    endTime: 352.53700000000003
  },
  {
    text: "de soucis, parce qu'on n'arrive pas à fournir à tout",
    startTime: 352.538,
    endTime: 354.904
  },
  {
    text: "le monde ce qu'il a besoin alors qu'il est possible",
    startTime: 354.904,
    endTime: 357.285
  },
  {
    text: "de le produire. Mais c'est tout à fait mon avis,",
    startTime: 357.285,
    endTime: 359.75
  },
  {
    text: "et c'est ainsi que cet excédent,",
    startTime: 359.75,
    endTime: 361.25
  },
  {
    text: 'ou ce soit-disant excédent de 8 millions de tonnes,',
    startTime: 361.25,
    endTime: 363.5
  },
  {
    text: "non pas de charbon mais d'acier,",
    startTime: 363.5,
    endTime: 365
  },
  {
    text: 'que révèle pour 1953 le rapport du département économique des',
    startTime: 365,
    endTime: 368.635
  },
  {
    text: 'Nations Unies, ne fera jamais,',
    startTime: 368.636,
    endTime: 370.453
  },
  {
    text: "même s'il était absorbé par les Européens,",
    startTime: 370.454,
    endTime: 373
  },
  {
    text: "ne fera jamais que la consommation par tête d'Européens dépasse",
    startTime: 373,
    endTime: 376.52799999999996
  },
  {
    text: '200 kilos par an et par tête.',
    startTime: 376.529,
    endTime: 379
  },
  {
    text: "Alors qu'aux Etats-Unis, actuellement,",
    startTime: 379,
    endTime: 380.646
  },
  {
    text: "déjà la consommation par tête d'Américains d'acier par an est",
    startTime: 380.647,
    endTime: 384.763
  },
  {
    text: "de 500 kilos. Je crois donc qu'il est difficile de",
    startTime: 384.764,
    endTime: 388.333
  },
  {
    text: "dire qu'en 1953, nous aurons,",
    startTime: 388.333,
    endTime: 389.999
  },
  {
    text: "nous autres Européens, trop d'acier et trop de charbon,",
    startTime: 390,
    endTime: 393
  },
  {
    text: 'mais que comme le disait,',
    startTime: 393,
    endTime: 394.427
  },
  {
    text: "ou comme le suggérait tout à l'heure M.",
    startTime: 394.428,
    endTime: 396.713
  },
  {
    text: 'Servant-Samaire, nous ne saurons pas comment distribuer cet acier et',
    startTime: 396.714,
    endTime: 399.25
  },
  {
    text: 'ce charbon, mais que nous en aurons le plus grand',
    startTime: 399.25,
    endTime: 401.75
  },
  {
    text: "besoin. Nous n'en aurons pas trop,",
    startTime: 401.75,
    endTime: 403.52099999999996
  },
  {
    text: 'mais nous serons insuffisants au point de vue distribution,',
    startTime: 403.521,
    endTime: 406.26
  },
  {
    text: 'après avoir été suffisants au point de vue production.',
    startTime: 406.26,
    endTime: 409
  },
  {
    text: 'Je retrouve dans ce que dit Gaspel quelque chose de',
    startTime: 410,
    endTime: 414.166
  },
  {
    text: "très intéressant, c'est qu'au fond,",
    startTime: 414.166,
    endTime: 415.922
  },
  {
    text: 'nous sommes chacun les victimes de nos propres positions philosophiques.',
    startTime: 415.923,
    endTime: 419
  },
  {
    text: "Les Américains ne se posent pas à la question d'un",
    startTime: 419,
    endTime: 422
  },
  {
    text: 'excédent, car ils considèrent comme une sorte de loi inéluctable',
    startTime: 422,
    endTime: 425
  },
  {
    text: "d'être obligés chaque année de produire plus et de consommer",
    startTime: 425,
    endTime: 429.166
  },
  {
    text: 'plus parfaitement. Ils ont en quelque sorte déclaré,',
    startTime: 429.166,
    endTime: 431.999
  },
  {
    text: "ouvertement au monde, que la santé économique de l'Amérique défendait",
    startTime: 432,
    endTime: 435.578
  },
  {
    text: "d'une augmentation régulière chaque année de 20% par exemple de",
    startTime: 435.578,
    endTime: 439.262
  },
  {
    text: 'la production. Au contraire,',
    startTime: 439.263,
    endTime: 440.908
  },
  {
    text: 'nous avons vécu dans une position de nationalisme protectionniste qui',
    startTime: 440.909,
    endTime: 445.269
  },
  {
    text: 'nous a fait en quelque sorte peur de dépasser les',
    startTime: 445.269,
    endTime: 447.961
  },
  {
    text: "limites que nous nous étions imposés dans le temps d'une",
    startTime: 447.961,
    endTime: 450.653
  },
  {
    text: 'conférence entre nous en Europe.',
    startTime: 450.653,
    endTime: 452
  },
  {
    text: 'Et voilà pourquoi le problème devient politique,',
    startTime: 452,
    endTime: 453.908
  },
  {
    text: "c'est qu'il faut briser...",
    startTime: 453.909,
    endTime: 455
  },
  {
    text: 'Pour maintenir des privilèges,',
    startTime: 455,
    endTime: 457
  },
  {
    text: "c'est évident. Nous sommes tout à fait d'accord.",
    startTime: 457,
    endTime: 460
  },
  {
    text: 'On pourrait presque dire,',
    startTime: 460,
    endTime: 461.11
  },
  {
    text: 'en une formule simplifiée,',
    startTime: 461.111,
    endTime: 462.221
  },
  {
    text: "que nous avons toujours peur d'être trop riches pour nous.",
    startTime: 462.222,
    endTime: 465
  },
  {
    text: "Alors qu'au contraire, les Américains,",
    startTime: 465,
    endTime: 466.427
  },
  {
    text: "eux, ont l'impression qu'ils ne sont jamais assez riches.",
    startTime: 466.428,
    endTime: 469
  },
  {
    text: "C'était vrai sur le plan français.",
    startTime: 469,
    endTime: 472
  },
  {
    text: 'Croyez-vous que si on arrive à abattre les frontières européennes,',
    startTime: 472,
    endTime: 476
  },
  {
    text: "j'entends celles de l'Europe occidentale,",
    startTime: 476,
    endTime: 478
  },
  {
    text: "la situation sera différente ? J'en suis persuadé.",
    startTime: 478,
    endTime: 480.937
  },
  {
    text: 'Malheureusement, les États européens ne sont pas,',
    startTime: 480.937,
    endTime: 483.124
  },
  {
    text: "nous le disions aussi l'autre jour,",
    startTime: 483.125,
    endTime: 485
  },
  {
    text: 'comme les différents États des États-Unis.',
    startTime: 485,
    endTime: 487
  },
  {
    text: "Ils n'ont, leurs frontières n'ont pas été tracées par amour",
    startTime: 487,
    endTime: 489.85600000000005
  },
  {
    text: 'de la ligne droite,',
    startTime: 489.857,
    endTime: 491
  },
  {
    text: "mais elles résultent d'une histoire qui a duré pendant des",
    startTime: 491,
    endTime: 494.635
  },
  {
    text: 'siècles. Et abattre ces nationalismes et abattre les douanières douanières',
    startTime: 494.636,
    endTime: 498.856
  },
  {
    text: 'est une opération extrêmement difficile.',
    startTime: 498.857,
    endTime: 501
  },
  {
    text: "D'autant que, quelques partisans que je sois de cet abattement,",
    startTime: 501,
    endTime: 504.5
  },
  {
    text: "il ne faut pas oublier que l'Europe est encore convalescente.",
    startTime: 504.5,
    endTime: 508
  },
  {
    text: "Et que l'ouverture brutale des frontières...",
    startTime: 508,
    endTime: 510
  },
  {
    text: "Il faudrait qu'elle ne retombe pas malade en gardant le",
    startTime: 510,
    endTime: 512.5
  },
  {
    text: "même système. Et l'ouverture brutale des frontières déterminera très certainement",
    startTime: 512.5,
    endTime: 517.571
  },
  {
    text: "des disparitions d'usines, des disparitions d'affaires,",
    startTime: 517.571,
    endTime: 521
  },
  {
    text: "d'où du chômage, d'où des crises auxquelles il faut penser",
    startTime: 521,
    endTime: 524.333
  },
  {
    text: 'et auxquelles il faut parer.',
    startTime: 524.333,
    endTime: 526
  },
  {
    text: 'Certains de nos amis,',
    startTime: 526,
    endTime: 527.646
  },
  {
    text: "notamment les Allemands, pensent eux qu'il faudrait abattre tout de",
    startTime: 527.647,
    endTime: 531.7629999999999
  },
  {
    text: 'suite ces frontières. Dans des discussions que nous avons avec',
    startTime: 531.764,
    endTime: 534.312
  },
  {
    text: "eux, ils nous disent qu'il faut faire le plongeon.",
    startTime: 534.312,
    endTime: 536
  },
  {
    text: "Nous sommes d'accord que le plongeon serait une méthode,",
    startTime: 537,
    endTime: 539.999
  },
  {
    text: "mais nous avons plus à perdre qu'à ce plongeon.",
    startTime: 540,
    endTime: 543
  },
  {
    text: "Ils ont ce que nous appelons ce qu'ils appellent l'esprit",
    startTime: 543,
    endTime: 545.6310000000001
  },
  {
    text: 'de catastrophe, car ils vivent encore dans des ruines,',
    startTime: 545.631,
    endTime: 548
  },
  {
    text: 'tandis que nous, qui sommes à un stade déjà plus',
    startTime: 548,
    endTime: 550.222
  },
  {
    text: 'avancé sur le voie de la voie de la reconstruction,',
    startTime: 550.222,
    endTime: 552.444
  },
  {
    text: "nous avons peur d'un retour en arrière.",
    startTime: 552.444,
    endTime: 554
  },
  {
    text: 'Les problèmes des autres Européens sont aussi les nôtres,',
    startTime: 554,
    endTime: 556.347
  },
  {
    text: "parce qu'ils le deviendraient forcément,",
    startTime: 556.347,
    endTime: 557.651
  },
  {
    text: 'même si nous ne les considérons pas comme tels.',
    startTime: 557.652,
    endTime: 560
  },
  {
    text: "Mais d'une façon générale,",
    startTime: 560,
    endTime: 561.2719999999999
  },
  {
    text: 'il est bien certain que nous ne pourrons pas rester',
    startTime: 561.272,
    endTime: 564.454
  },
  {
    text: 'indéfiniment sans prendre des décisions de ce côté-là.',
    startTime: 564.454,
    endTime: 567
  },
  {
    text: "Vous avez d'accord. Vous voyez ce que dit l'OC.",
    startTime: 567,
    endTime: 569.5
  },
  {
    text: "L'OC, dans son rapport sur le charbon,",
    startTime: 569.5,
    endTime: 571.25
  },
  {
    text: "prévoit qu'il y en aura de trop.",
    startTime: 571.25,
    endTime: 573
  },
  {
    text: "Et que dit-il ? Il dit qu'il n'y en aura",
    startTime: 573,
    endTime: 575.142
  },
  {
    text: 'pas beaucoup trop, ce qui est faux,',
    startTime: 575.142,
    endTime: 576.642
  },
  {
    text: "parce que d'après ce qui s'est passé dans les dernières",
    startTime: 576.642,
    endTime: 578.7850000000001
  },
  {
    text: 'années, on voit que les prévisions seront dépassées.',
    startTime: 578.785,
    endTime: 581.058
  },
  {
    text: 'Et alors, il parle déjà de produire du pétrole synthétique.',
    startTime: 581.058,
    endTime: 584
  },
  {
    text: "C'est-à-dire que, parce que nous aurions trop de charbon,",
    startTime: 584,
    endTime: 586.076
  },
  {
    text: 'nous ferions du pétrole.',
    startTime: 586.076,
    endTime: 587
  },
  {
    text: 'Et nous ferions ainsi concurrence au pétrole naturel.',
    startTime: 587,
    endTime: 589
  },
  {
    text: "Je n'ai pas l'impression que ça satisfait beaucoup les auteurs",
    startTime: 589,
    endTime: 592.333
  },
  {
    text: 'du grand-marchat. Mais ça montre à quel point la question',
    startTime: 592.333,
    endTime: 596.076
  },
  {
    text: 'des frontières européennes est dépassée.',
    startTime: 596.076,
    endTime: 598
  },
  {
    text: "Et si le pétrole est de l'autre côté et le",
    startTime: 598,
    endTime: 600.726
  },
  {
    text: 'charbon excédentaire de ce côté-ci,',
    startTime: 600.727,
    endTime: 602.09
  },
  {
    text: "si les frontières étaient à l'échelon occidental,",
    startTime: 602.09,
    endTime: 604
  },
  {
    text: 'le problème se poserait tout différemment.',
    startTime: 604,
    endTime: 606.4689999999999
  },
  {
    text: "Au contraire, si comme vous disiez tout à l'heure,",
    startTime: 606.47,
    endTime: 610.175
  },
  {
    text: 'M. Gasquel, on reste dans les frontières pour maintenir les',
    startTime: 610.176,
    endTime: 613.6659999999999
  },
  {
    text: 'privilèges, on évitera un plongeon.',
    startTime: 613.666,
    endTime: 615.333
  },
  {
    text: "C'est entendu. Mais est-ce qu'on n'en aura pas un autre",
    startTime: 615.333,
    endTime: 617.845
  },
  {
    text: 'pire ? Voilà le problème.',
    startTime: 617.846,
    endTime: 619
  },
  {
    text: "En somme, c'est un choix entre plusieurs plongeons.",
    startTime: 619,
    endTime: 621.499
  },
  {
    text: 'Il faut faire une révolution de toute façon.',
    startTime: 621.5,
    endTime: 624
  },
  {
    text: "Le mieux, c'est de faire la révolution des frontières.",
    startTime: 624,
    endTime: 626
  },
  {
    text: "Tout à fait d'accord.",
    startTime: 626,
    endTime: 626.922
  },
  {
    text: "Mais je crois qu'il faut y aller assez prudemment.",
    startTime: 626.923,
    endTime: 629
  },
  {
    text: 'Nous avons en tout cas,',
    startTime: 629,
    endTime: 630.153
  },
  {
    text: "il ne faut jamais l'oublier dans nos discussions,",
    startTime: 630.153,
    endTime: 632
  },
  {
    text: 'nous avons ce que les Américains regardent eux-mêmes comme une',
    startTime: 632,
    endTime: 635.333
  },
  {
    text: 'nécessité pour leur propre développement,',
    startTime: 635.333,
    endTime: 637
  },
  {
    text: "nous avons l'étendue, nous avons l'espace.",
    startTime: 637,
    endTime: 638.999
  },
  {
    text: 'Car il ne faut jamais oublier de faire intervenir les',
    startTime: 639,
    endTime: 642.375
  },
  {
    text: "territoires non développés ou insuffisamment développés de l'Afrique et même",
    startTime: 642.375,
    endTime: 646.125
  },
  {
    text: "de l'Asie dans nos prévisions.",
    startTime: 646.125,
    endTime: 648
  },
  {
    text: "C'est pour ça que je suis plus optimiste que le",
    startTime: 648,
    endTime: 651.076
  },
  {
    text: "sont beaucoup d'autres. Même une surproduction d'acier,",
    startTime: 651.076,
    endTime: 653.249
  },
  {
    text: 'pour moi, ne me paraît pas si grave.',
    startTime: 653.25,
    endTime: 655.749
  },
  {
    text: 'Mais je voudrais retourner.',
    startTime: 655.75,
    endTime: 657
  },
  {
    text: "J'ai une autre crainte et je vais poser une question,",
    startTime: 657,
    endTime: 660.076
  },
  {
    text: "M. Schreiber. Celle-ci. Nous venons d'eux parler du charbon ou",
    startTime: 660.076,
    endTime: 663.333
  },
  {
    text: "à propos du charbon de l'avenir économique européen.",
    startTime: 663.333,
    endTime: 666
  },
  {
    text: "Il n'y a pas que le charbon comme élément d'énergie.",
    startTime: 666,
    endTime: 669
  },
  {
    text: 'Et ne croyez-vous pas que ce serait plutôt là que',
    startTime: 669,
    endTime: 672.529
  },
  {
    text: "serait pour nous l'élément de difficulté future,",
    startTime: 672.529,
    endTime: 675
  },
  {
    text: 'plutôt que dans ce qui nous est annoncé par le',
    startTime: 675,
    endTime: 677.856
  },
  {
    text: "rapport de l'océan ? Je suis enchanté de votre question,",
    startTime: 677.857,
    endTime: 680.333
  },
  {
    text: 'mon cher ministre. Et M.',
    startTime: 680.333,
    endTime: 681.6659999999999
  },
  {
    text: 'Schreiber. Au fond, nous nous trouvons dans la situation de',
    startTime: 681.666,
    endTime: 684.6999999999999
  },
  {
    text: 'gens qui auraient discuté au temps des derniers bateaux à',
    startTime: 684.7,
    endTime: 687.6999999999999
  },
  {
    text: 'voile, quand Fulton avait déjà inventé le bateau à vapeur,',
    startTime: 687.7,
    endTime: 690.7379999999999
  },
  {
    text: 'sur la question de la répartition future du fret sur',
    startTime: 690.739,
    endTime: 693.7819999999999
  },
  {
    text: 'les bateaux à voile.',
    startTime: 693.782,
    endTime: 695
  },
  {
    text: "Nous discutons toujours en arrière d'une idée.",
    startTime: 695,
    endTime: 698
  },
  {
    text: 'En réalité, nous discutons du charbon alors que déjà il',
    startTime: 698,
    endTime: 701.477
  },
  {
    text: 'y a des usines atomiques qui fonctionnent aux États-Unis et',
    startTime: 701.478,
    endTime: 704.9549999999999
  },
  {
    text: 'même en URSS. Par conséquent,',
    startTime: 704.956,
    endTime: 706.46
  },
  {
    text: "il n'est pas douteux que dans les quelques années qui",
    startTime: 706.461,
    endTime: 708.768
  },
  {
    text: "viennent, peut-être plus rapidement pour l'énergie atomique employée pour la",
    startTime: 708.769,
    endTime: 712.6
  },
  {
    text: 'paix, comme ça a été plus rapidement pour la bombe',
    startTime: 712.6,
    endTime: 715.076
  },
  {
    text: 'atomique pour la guerre,',
    startTime: 715.076,
    endTime: 716
  },
  {
    text: 'nous aurons une énergie tellement plus importante et tellement plus',
    startTime: 716,
    endTime: 719.124
  },
  {
    text: 'facile à employer que le charbon que le problème du',
    startTime: 719.125,
    endTime: 723.333
  },
  {
    text: 'charbon nous paraîtra complètement dépassé.',
    startTime: 723.333,
    endTime: 725
  },
  {
    text: 'En somme, le problème est de faire croître les besoins.',
    startTime: 725,
    endTime: 727
  },
  {
    text: 'Certainement. Mais je ne suis pas tout à fait aussi',
    startTime: 727,
    endTime: 730.999
  },
  {
    text: 'optimiste que notre ami M.',
    startTime: 731,
    endTime: 732.6659999999999
  },
  {
    text: "Schreiber sur le développement possible et l'utilisation possible dans un",
    startTime: 732.666,
    endTime: 735.5699999999999
  },
  {
    text: "avenir prochain de l'énergie atomique.",
    startTime: 735.571,
    endTime: 737
  },
  {
    text: "Je crois que jusqu'à présent,",
    startTime: 737,
    endTime: 738.537
  },
  {
    text: "les résultats que l'on a obtenus aux États-Unis,",
    startTime: 738.538,
    endTime: 741
  },
  {
    text: "je ne connais pas ceux de l'URSS,",
    startTime: 741,
    endTime: 743.0999999999999
  },
  {
    text: 'sont assez décevants. En ce sens que le kWh produit',
    startTime: 743.1,
    endTime: 745.999
  },
  {
    text: 'avec les usines atomiques coûte horriblement cher,',
    startTime: 746,
    endTime: 748
  },
  {
    text: 'en moyenne 20 ou 30 % plus cher que celui',
    startTime: 749,
    endTime: 751.352
  },
  {
    text: "que l'on obtient à partir du charbon.",
    startTime: 751.352,
    endTime: 753
  },
  {
    text: "Et d'autre part, les centrales atomiques ne sont pas très",
    startTime: 753,
    endTime: 755.726
  },
  {
    text: 'bougeables. Elles pèsent des centaines de milliers de tonnes.',
    startTime: 755.727,
    endTime: 758
  },
  {
    text: 'Mais pour le moment.',
    startTime: 758,
    endTime: 759
  },
  {
    text: "Pour le moment. C'est comme au début.",
    startTime: 759,
    endTime: 761
  },
  {
    text: "Comme au début d'ATSM,",
    startTime: 761,
    endTime: 762.09
  },
  {
    text: 'vous aviez des appareils immenses et coûteux.',
    startTime: 762.09,
    endTime: 764
  },
  {
    text: 'Et puis maintenant, vous avez des petits appareils qui ne',
    startTime: 764,
    endTime: 766.5
  },
  {
    text: "coûtent rien. De même que pour l'aviation,",
    startTime: 766.5,
    endTime: 768.3620000000001
  },
  {
    text: 'vous aviez des passages infiniment coûteux.',
    startTime: 768.363,
    endTime: 770
  },
  {
    text: "Et maintenant, l'aviation concurrence le chemin de fer.",
    startTime: 770,
    endTime: 772
  },
  {
    text: "Oui, mais d'accord. Mais entre le moment où l'avion Adair",
    startTime: 772,
    endTime: 775.333
  },
  {
    text: 'a fait ses premiers essais et le moment où on',
    startTime: 775.333,
    endTime: 778.25
  },
  {
    text: "a traversé l'Atlantique, économiquement parlant,",
    startTime: 778.25,
    endTime: 780
  },
  {
    text: 'dans de bonnes conditions,',
    startTime: 780,
    endTime: 782
  },
  {
    text: "il s'est écoulé tout de même au moins une cinquantaine",
    startTime: 782,
    endTime: 783.817
  },
  {
    text: "d'années. Par conséquent... Pardon,",
    startTime: 783.818,
    endTime: 785.333
  },
  {
    text: 'pardon, pardon, mon cher confrère.',
    startTime: 785.333,
    endTime: 787
  },
  {
    text: 'Pardon. Pardon, monsieur Gachouel.',
    startTime: 787,
    endTime: 789
  },
  {
    text: 'Vous savez très bien que maintenant,',
    startTime: 789,
    endTime: 790.2
  },
  {
    text: 'les choses se déroulent à un rythme beaucoup plus rapide.',
    startTime: 790.2,
    endTime: 793
  },
  {
    text: 'Oui. En un demi-siècle,',
    startTime: 793,
    endTime: 794.5440000000001
  },
  {
    text: 'nous avons vu les projets que vous savez.',
    startTime: 794.545,
    endTime: 796
  },
  {
    text: 'Maintenant, il faut demander ce qui se passera dans les',
    startTime: 796,
    endTime: 798.142
  },
  {
    text: 'dix ans qui viennent.',
    startTime: 798.142,
    endTime: 799
  },
  {
    text: 'Oui, mais vous ne pouvez pas faire parler des cinq',
    startTime: 799,
    endTime: 801.142
  },
  {
    text: 'ans pour le moment.',
    startTime: 801.142,
    endTime: 802
  },
  {
    text: 'Vous ne pouvons pas avoir ce name sur ce point',
    startTime: 802,
    endTime: 804.142
  },
  {
    text: 'de très grande lumière.',
    startTime: 804.142,
    endTime: 805
  },
  {
    text: "D'accord. Il faut donc que nous nous mettions dans la",
    startTime: 805,
    endTime: 809.4530000000001
  },
  {
    text: "pensée suivante, qu'elle est compte tenu de ces prévisions,",
    startTime: 809.454,
    endTime: 813
  },
  {
    text: "compte tenu de l'existence d'une recherche déjà très poussée,",
    startTime: 813,
    endTime: 816
  },
  {
    text: "compte tenu également des autres formes d'énergie,",
    startTime: 816,
    endTime: 819
  },
  {
    text: "qu'elle est l'avenir du charbon.",
    startTime: 819,
    endTime: 820
  },
  {
    text: 'Je reviens au départ de la question.',
    startTime: 820,
    endTime: 822
  },
  {
    text: "Je crois qu'il faut le regarder sous l'angle du prix",
    startTime: 822,
    endTime: 824.5
  },
  {
    text: 'de revient et que nous nous voyons clairement entre pays',
    startTime: 824.5,
    endTime: 828.555
  },
  {
    text: "européens, d'abord, comment le produire au meilleur compte possible,",
    startTime: 828.555,
    endTime: 832
  },
  {
    text: 'ensuite, comment le répartir dans les meilleures conditions possibles.',
    startTime: 832,
    endTime: 835
  },
  {
    text: "Évidemment, c'est le problème actuel.",
    startTime: 835,
    endTime: 836
  },
  {
    text: 'Et enfin, tenir compte dans les investissements,',
    startTime: 836,
    endTime: 838
  },
  {
    text: 'car nous ne sommes pas riches tout le temps que',
    startTime: 838,
    endTime: 840.5
  },
  {
    text: "nous sommes, tenir compte dans les investissements d'une certaine prudence,",
    startTime: 840.5,
    endTime: 843
  },
  {
    text: "c'est-à-dire ne pas mettre tous nos oeufs dans le même",
    startTime: 843,
    endTime: 845.726
  },
  {
    text: 'panier, et à ce point de vue-là,',
    startTime: 845.727,
    endTime: 847.713
  },
  {
    text: "faire en sorte que les autres formes d'énergie,",
    startTime: 847.714,
    endTime: 850
  },
  {
    text: "l'électrification, l'énergie atomique, que d'ailleurs il faut reconnaître qu'en France,",
    startTime: 850,
    endTime: 855
  },
  {
    text: 'il ne faut pas méconnaître notre effort en France,',
    startTime: 855,
    endTime: 857
  },
  {
    text: 'je voudrais vous en dire un mot plus tard,',
    startTime: 857,
    endTime: 859
  },
  {
    text: 'mais en tout cas,',
    startTime: 859,
    endTime: 859.841
  },
  {
    text: 'il y a vraiment là une question qui est la',
    startTime: 859.842,
    endTime: 861.946
  },
  {
    text: 'question à mes yeux capitale.',
    startTime: 861.947,
    endTime: 863
  },
  {
    text: 'Pauvres nous sommes, nous ne pouvons pas faire de gros',
    startTime: 863,
    endTime: 865.726
  },
  {
    text: 'investissements, il faut les faire bien.',
    startTime: 865.727,
    endTime: 867
  },
  {
    text: "Voilà au fond comment personnellement j'en vais,",
    startTime: 867,
    endTime: 869
  },
  {
    text: "je verrai l'avenir de la question.",
    startTime: 869,
    endTime: 871
  },
  {
    text: "Nous sommes tout à fait d'accord et nous rejoignons là",
    startTime: 871,
    endTime: 873.856
  },
  {
    text: "les recommandations de l'OSA,",
    startTime: 873.857,
    endTime: 875
  },
  {
    text: "à savoir qu'il faut que les pays européens s'entendent entre",
    startTime: 875,
    endTime: 878.571
  },
  {
    text: 'à propos des investissements,',
    startTime: 878.571,
    endTime: 880
  },
  {
    text: 'à propos de la production,',
    startTime: 880,
    endTime: 882
  },
  {
    text: 'et que certaines mines qui sont exploitées dans des conditions',
    startTime: 882,
    endTime: 885.845
  },
  {
    text: "défectueuses soient fermées, et qu'on supprime,",
    startTime: 885.846,
    endTime: 887.6659999999999
  },
  {
    text: 'en ce qui concerne les prix,',
    startTime: 887.666,
    endTime: 889
  },
  {
    text: 'la fâcheuse pratique du double prix,',
    startTime: 890,
    endTime: 892
  },
  {
    text: 'la fâcheuse pratique du prix bon marché pour les gens',
    startTime: 892,
    endTime: 894.306
  },
  {
    text: 'de chez soi, et du prix cher pour les gens',
    startTime: 894.307,
    endTime: 896.555
  },
  {
    text: "des extérieurs. Mais est-ce qu'on s'en rapproche ? C'est très",
    startTime: 896.555,
    endTime: 903.6659999999999
  },
  {
    text: "difficile, mais le seul fait que l'OSA et on parle,",
    startTime: 903.666,
    endTime: 907
  },
  {
    text: 'il y a actuellement des conversations franco-allemandes qui portent précisément',
    startTime: 907,
    endTime: 910.845
  },
  {
    text: "sur ce point. Elles viennent d'aboutir à une sensible réduction",
    startTime: 910.846,
    endTime: 914.8
  },
  {
    text: "du prix d'exportation. C'est déjà un point très important.",
    startTime: 914.8,
    endTime: 918
  },
  {
    text: "Je ne crois pas qu'elles aient abouti tout à fait",
    startTime: 918,
    endTime: 920.856
  },
  {
    text: "à l'égalisation des prix.",
    startTime: 920.857,
    endTime: 922
  },
  {
    text: "D'autant que les Allemands font remarquer avec juste raison qu'ils",
    startTime: 922,
    endTime: 924.941
  },
  {
    text: 'payent eux le minerai de fer suédois,',
    startTime: 924.941,
    endTime: 927
  },
  {
    text: 'beaucoup plus cher que les Suédois ne le payent eux-mêmes',
    startTime: 927,
    endTime: 929.6659999999999
  },
  {
    text: "lorsqu'ils le font sur place.",
    startTime: 929.666,
    endTime: 931
  },
  {
    text: "D'ailleurs, les Suédois, ils envoient leur minerai de fer aux",
    startTime: 931,
    endTime: 933.856
  },
  {
    text: 'États-Unis contre des dollars,',
    startTime: 933.857,
    endTime: 935
  },
  {
    text: 'tandis que nous, maintenant,',
    startTime: 935,
    endTime: 935.94
  },
  {
    text: 'nous arrivons à nous passer du charbon américain et à',
    startTime: 935.941,
    endTime: 938.293
  },
  {
    text: 'économiser des dollars. Il y a donc déjà une œuvre',
    startTime: 938.294,
    endTime: 940.75
  },
  {
    text: 'européenne. Évidemment, il faut bien aller pas à pas et',
    startTime: 940.75,
    endTime: 944.375
  },
  {
    text: 'marcher dans le sens européen pour commencer.',
    startTime: 944.375,
    endTime: 947
  },
  {
    text: "Mais combien on s'aperçoit quand on discute de ces problèmes,",
    startTime: 947,
    endTime: 949
  },
  {
    text: 'je ne sais pas si vous avez tout mon avis,',
    startTime: 949,
    endTime: 951
  },
  {
    text: "combien on s'aperçoit que même le problème européen va être",
    startTime: 951,
    endTime: 954.333
  },
  {
    text: 'dépassé avec une vitesse extraordinaire.',
    startTime: 954.333,
    endTime: 956
  },
  {
    text: "C'est-à-dire que si nous reprenons la question de l'énergie dont",
    startTime: 956,
    endTime: 958.222
  },
  {
    text: "on parlait tout à l'heure,",
    startTime: 958.222,
    endTime: 959.333
  },
  {
    text: "M. de Lina, il est bien certain qu'à côté de",
    startTime: 959.333,
    endTime: 961.825
  },
  {
    text: 'la question du charbon,',
    startTime: 961.826,
    endTime: 962.8679999999999
  },
  {
    text: 'il y a celle du pétrole,',
    startTime: 962.869,
    endTime: 964.433
  },
  {
    text: "il y a celle de l'hydroïcité,",
    startTime: 964.434,
    endTime: 966
  },
  {
    text: "il y a celle d'énergie atomique et que tout cela",
    startTime: 966,
    endTime: 968.142
  },
  {
    text: 'forme un tout mondial.',
    startTime: 968.142,
    endTime: 969
  },
  {
    text: 'En somme, nous sommes au point suivant.',
    startTime: 969,
    endTime: 971
  },
  {
    text: 'Le problème du charbon nous prouve que les difficultés que',
    startTime: 971,
    endTime: 975.666
  },
  {
    text: "nous rencontrerons pour l'organisation européenne sont des difficultés qui peuvent",
    startTime: 975.666,
    endTime: 980.221
  },
  {
    text: 'être estimées et pesées.',
    startTime: 980.222,
    endTime: 982
  },
  {
    text: 'Elles ne nous échappent point.',
    startTime: 982,
    endTime: 983
  },
  {
    text: 'Nous sommes dans une position,',
    startTime: 983,
    endTime: 985.2719999999999
  },
  {
    text: 'au fond, honnête à ce sujet.',
    startTime: 985.272,
    endTime: 988
  },
  {
    text: 'La question de savoir comment les régler est une question',
    startTime: 988,
    endTime: 990.104
  },
  {
    text: "d'abord de bonne volonté de la part des gouvernements et",
    startTime: 990.105,
    endTime: 992.25
  },
  {
    text: "de technicité et d'opportunisme,",
    startTime: 992.25,
    endTime: 993.25
  },
  {
    text: 'si je puis dire,',
    startTime: 993.25,
    endTime: 994.25
  },
  {
    text: "économique de l'ordre. J'ajouterai deux fois dans l'avenir de l'ordre.",
    startTime: 994.25,
    endTime: 997
  },
  {
    text: "D'accord. Vous venez d'entendre la Ronde des Nations Revue hebdomadaire",
    startTime: 997,
    endTime: 1015.46
  },
  {
    text: 'de la coopération internationale avec cette semaine Émile Servan-Schreiber,',
    startTime: 1015.461,
    endTime: 1019.726
  },
  {
    text: 'Jacques Gasquel et Paul de Vina.',
    startTime: 1019.727,
    endTime: 1023
  },
  {
    text: "Sous-titres réalisés para la communauté d'Amara.org",
    startTime: 1027,
    endTime: 1030
  }
])
</script>
