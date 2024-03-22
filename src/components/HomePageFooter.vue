<template>
  <footer class="p-5 bg-dark mt-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-4">
          <div class="logo">
            <a
              href="https://dhlab.epfl.ch/"
              target="_blank"
              title="Digital Humanities Laboratory (DHLAB) Ecole Polytechnique Federale de Lausanne, Switzerland"
            >
              <EpflLogo />
            </a>
            <p>
              Digital Humanities Laboratory (DHLAB) Ecole Polytechnique Federale de Lausanne,
              Switzerland
            </p>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="logo">
            <a
              href="http://www.cl.uzh.ch/en.html"
              target="_blank"
              title="Institute for Computational Linguistics Zurich University, Switzerland"
            >
              <UzhLogo />
              <!-- <img src="https://impresso-project.ch/assets/images/uzh-logo.jpg" /> -->
            </a>
            <p>Institute of Computational Linguistics Zurich University, Switzerland</p>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="logo">
            <a
              href="https://www.c2dh.uni.lu"
              target="_blank"
              title="Centre for Contemporary and Digital History (C2DH) Luxembourg University, Luxembourg."
            >
              <UniLogo />
            </a>
            <p>
              Centre for Contemporary and Digital History (C2DH) Luxembourg University, Luxembourg.
            </p>
          </div>
        </div>
      </div>

      <div class="line double my-4"></div>

      <div class="row text-center">
        <div class="logo col-sm-12">
          <a
            href="http://www.snf.ch/en/Pages/default.aspx"
            target="_blank"
            title="Swiss National Science Foundation"
            id="snsf-logo"
          >
            <SnsfLogo />
          </a>
        </div>
      </div>

      <div class="line my-4"></div>

      <div class="row text-center">
        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a
              href="https://impresso-project.ch/consortium/#snl"
              title="Swiss National Library, SNL"
            >
              <ScccLogo class="mb-3" />
              <p>Swiss National Library, SNL</p>
            </a>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a
              href="https://impresso-project.ch/consortium/#bnl"
              title="National Library of Luxembourg, BnL."
            >
              <BnlLogo class="mb-3" />
              <p>National Library of Luxembourg, BnL.</p>
            </a>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a
              href="https://impresso-project.ch/consortium/#aev"
              title="State Archives of Valais, AEV."
            >
              <AevswLogo class="mb-3" />
              <p>State Archives of Valais, AEV.</p>
            </a>
          </div>
        </div>

        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a
              href="https://impresso-project.ch/consortium/#swa"
              title="Swiss Economic Archives, SWA."
            >
              <UbLogo class="mb-3" />
              <p>Swiss Economic Archives, SWA.</p>
            </a>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a href="https://impresso-project.ch/consortium/#le-temps" title="Le Temps">
              <LetempsLogo class="mb-3" />
              <p>Le Temps</p>
            </a>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a
              href="https://impresso-project.ch/consortium/#nzz"
              title="Neue Zürcher Zeitung, NZZ."
            >
              <NzzLogo class="mb-3" />
              <p>Neue Zürcher Zeitung, NZZ.</p>
            </a>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a href="/consortium/#unil" title="History department, University of Lausanne, UNIL.">
              <UnilLogo class="mb-3" />
              <p>History department, <br />University of Lausanne, UNIL.</p>
            </a>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="logo smaller">
            <a href="https://impresso-project.ch/consortium/#infoclio" title="infoclio">
              <InfoclioLogo class="mb-3" />
              <p>infoclio</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import EpflLogo from '../assets/img/EpflLogo.vue'
import UzhLogo from '../assets/img/UzhLogo.vue'
import UniLogo from '../assets/img/UniLogo.vue'
import SnsfLogo from '../assets/img/SnsfLogo.vue'
import UnilLogo from '../assets/img/UnilLogo.vue'
import BnlLogo from '../assets/img/BnlLogo.vue'
import ScccLogo from '../assets/img/ScccLogo.vue'
import AevswLogo from '../assets/img/AevswLogo.vue'
import UbLogo from '../assets/img/UbLogo.vue'
import LetempsLogo from '../assets/img/LetempsLogo.vue'
import NzzLogo from '../assets/img/NzzLogo.vue'
import InfoclioLogo from '../assets/img/InfoclioLogo.vue'

export default {
  components: {
    EpflLogo,
    UzhLogo,
    UniLogo,
    SnsfLogo,
    UnilLogo,
    BnlLogo,
    ScccLogo,
    AevswLogo,
    UbLogo,
    LetempsLogo,
    NzzLogo,
    InfoclioLogo,
  },
}
</script>

<style lang="scss" scoped>
footer {
  font-size: smaller;
  color: var(--clr-grey-600);

  h3 {
    color: var(--clr-grey-700);
  }
  .logo {
    a svg,
    a svg path {
      fill: var(--clr-grey-900);
    }
    a:hover svg,
    a:hover svg path {
      fill: var(--impresso-color-yellow);
    }

    a#snsf-logo {
      display: inline-block;
      height: 100% !important;
      margin: 3rem 0;
      min-width: 240px;
      svg {
        max-width: 240px;
      }
    }

    a {
      display: flex;
      flex-direction: column;
      align-items: left;
      margin-bottom: 20px;
      position: relative;
      width: auto !important;
      text-decoration: none;

      svg {
        min-width: 100px;
        max-width: 180px;
        max-height: 100px;
        transition: all 0.2s ease;
      }

      p {
        width: 100%;
        text-align: left;
        color: var(--clr-grey-600);
        transition: all 0.2s ease;
      }
      &:hover {
        p {
          color: white;
        }
      }
    }
  }

  .line {
    border-bottom: 1px solid var(--clr-grey-700);
    &.double {
      border-bottom-width: 2px;
    }
  }
  a:hover {
    background: none;
  }
}
</style>
