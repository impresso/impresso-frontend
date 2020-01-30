<template lang="html">
  <i-layout id="ConnectedTextReuseClustersPage">
    <i-layout-section width="400px" class="border-right">
      <div slot="header" class="border-bottom p-2 pb-4">
        <cluster-text-search-panel/>
      </div>
      <div class="p-2">
        <cluster-details-panel
          class="p-2"
          v-for="item in clusterItems"
          :key="item.cluster.id"
          :cluster="item.cluster"
          :textSample="item.textSample"/>
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
        [connected clusters placeholder]
    </i-layout-section>
  </i-layout>
</template>

<script>
import ClusterTextSearchPanel from '@/components/modules/textReuse/ClustersSearchPanel'
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel'

export default {
  data: () => ({
    clusterItems: [...Array(4).keys()].map(() => ({
      cluster: {
        id: '32',
        lexicalOverlap: 25,
        clusterSize: 80757,
        timeCoverage: {
          from: '1937-10-09',
          to: '2004-12-11'
        }
      },
      textSample: '13.00 Tagesschau. 13.10 OlmaTAF. 13.40\nTAFgeld. 13.55 Gib dem Affen Zucker. Spiel-\nfilm von Castellano & Pipolo (1981). Mit Adria-\nno Celentano, Ornella Muti, Adolfo Celi, Milla\nSannoner, Enzo Garinei. 15.35 Kampf um Yel-\nlow Rose. Familiensaga. Mit Sam Elliott David\nSoûl, Edward Albert 16.25 RatselTAF. 16.45\nReiter mit der Maske. Zeichentrickserie. 16.55\nSimon, der Traumer. Spielfilm von Roger Cantin\n(1990). Mit Hugolin Chevrette-Landesque, Pa-\ntrick Saint-Pierre, Benoît Robitaille. 17.40 Gu-\ntenacht-Geschichte. 17.50 Tagesschau. 18.00\nAir Albatros. Série. 19.00 Schweiz aktuell.\n19.30 Tagesschau. 19.50 Meteo. 20.00 Landuf,\nlandab. 21.05 Menschen, Technik, Wissen-\nschaft 21.50 10 vor 10.22.20 DOK. 23.15\nBarton Fink. Spielfilm von Joël und Ethan Coen\n(1991). Mit John Turturrojohn Goodman, Judy\nDavis, Michael Lerner. John Mahoney.\n12.45 Telegiornale tredici. 13.00 Passioni. Té-\nléfilm. 13.50 La grande vallata. Téléfilm. 14.40\nAlpe-Adria. 15.10 Albert Einstein : Corne vedo\nil mondo. 16.10 Textvision. 16.15 Caribe (R).\nTelenovela. 17.00 Telecicova. 17.40 Qua la\nzampa. Téléfilm. 18.05 Primi baci. Téléfilm.\n18.35 Superboy. Téléfilm. Con Gérard Christo-\npher, Stacy Haiduk, llan Mitchell-Smith. 19.00\nTelegiornale flash. 19.10 L\'economia. 19.30 II\nQuotidiano. 20.00 Telegiornale / Meteo. 20.30\nFAX. 21.50 Dream on. Téléfilm. 22.20 Gran-\ndangolo. 23.15 Telegiornale notte. 23.35 Vel-\nvet Underground.\nS PLUS\n6.00 Euronews. 7.00 Euronews. 7.30 Schweiz-\nVision / Textvision. 12.00 Euronews. 14.00\nTextvision. 15.00 Euronews. 17.30 Textvision.\n18.00 Euronews. 19.10 Star Trek. Science-fic-\ntion-Serie. 20.00 Tagesschau / Meteo. 20.25\nCash-TV Plus. 20.30 Cash-TV (W). 20.55 Fax.\n21.00 MacGyver. Abenteuerserie. Mit Richard\nDean Anderson, Dana Elcar, Use Cutter. 21.50\nCity Arte. 22.35 Formel S'
    }))
  }),
  components: {
    ClusterTextSearchPanel,
    ClusterDetailsPanel,
  }
};
</script>
