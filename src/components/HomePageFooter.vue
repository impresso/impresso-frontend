<template>
  <footer class="bg-dark m-xl-3">
    <div class="container-fluid">
      <div class="line double my-4"></div>
      <h3 class="mb-3">Partners</h3>
      <div class="row">
        <div class="col-md-12 col-lg-6 col-xl-3">
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
        <div class="col-md-12 col-lg-6 col-xl-3">
          <div class="logo">
            <a
              href="http://www.cl.uzh.ch/en.html"
              target="_blank"
              title="Institute for Computational Linguistics Zurich University, Switzerland"
            >
              <UzhLogo />
            </a>
            <p>Institute of Computational Linguistics Zurich University, Switzerland</p>
          </div>
        </div>
        <div class="col-md-12 col-lg-6 col-xl-3">
          <div class="logo">
            <a
              href="https://www.unil.ch/hist/fr/home.html"
              title="History department, University of Lausanne, UNIL."
            >
              <UnilLogo class="mb-3" />
            </a>
            <p>History department, <br />University of Lausanne, UNIL.</p>
          </div>
        </div>
        <div class="col-md-12 col-lg-6 col-xl-3">
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
      <h3 class="mb-3">Associated Partners</h3>
      <div class="row">
        <div v-for="(d, index) in partners" :key="index" class="col-sm-12 col-md-6 mb-3">
          <a :href="d.href" :title="d.title" target="_blank">{{ d.title }}</a>
        </div>
      </div>

      <div class="line double my-4"></div>
      <h3 class="mb-3">Funding agencies</h3>

      <div class="row">
        <div class="col-sm-12 col-md-6">
          <div class="logo">
            <a
              href="http://www.snf.ch/en/Pages/default.aspx"
              target="_blank"
              title="Swiss National Science Foundation"
            >
              <SnsfLogo />
            </a>
            <p>
              The Swiss National Science Foundation (SNSF) funds excellent research at universities
              and other institutions – from chemistry to medicine to sociology
            </p>
          </div>
        </div>
        <div class="col-sm-12 col-md-6">
          <div class="logo">
            <a
              href="https://www.fnr.lu/"
              target="_blank"
              title="Luxembourg National Research Fund - Aller à l'accueil"
            >
              <FnrLogo />
            </a>
            <p>
              The Luxembourg National Research Fund (FNR) is the main funder of research activities
              in Luxembourg
            </p>
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
import FnrLogo from '../assets/img/FnrLogo.vue'
import partners from './footerLinks.json'

export default {
  components: {
    EpflLogo,
    UzhLogo,
    UniLogo,
    SnsfLogo,
    UnilLogo,
    FnrLogo
  },
  data: () => ({
    partners
  })
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
