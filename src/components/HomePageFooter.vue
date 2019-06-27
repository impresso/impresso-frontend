<template lang="html">
  <footer class="p-5 bg-light">
    <div class="container">
      <div class="row">
        <div class="col-sm-4">
          <div class="logo">
            <a href="https://dhlab.epfl.ch/" target="_blank" title="Digital Humanities Laboratory (DHLAB) Ecole Polytechnique Federale de Lausanne, Switzerland">
              <img src="https://impresso-project.ch/assets/images/EPFL-Logo-BLACK.png">
            </a>
            <p>Digital Humanities Laboratory (DHLAB) Ecole Polytechnique Federale de Lausanne, Switzerland</p>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="logo">
            <a href="http://www.cl.uzh.ch/en.html" target="_blank" title="Institute for Computational Linguistics Zurich University, Switzerland">
              <img src="https://impresso-project.ch/assets/images/uzh-logo.jpg">
            </a>
            <p>Institute of Computational Linguistics Zurich University, Switzerland</p>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="logo">
            <a href="https://www.c2dh.uni.lu" target="_blank" title="Centre for Contemporary and Digital History (C2DH) Luxembourg University, Luxembourg.">
              <img src="https://impresso-project.ch/assets/images/c2dh-logo.png">
            </a>
            <p>Centre for Contemporary and Digital History (C2DH) Luxembourg University, Luxembourg.</p>
          </div>
        </div>
      </div>

      <div class="line double my-4"></div>

      <div class="row">
        <div class="col-sm-4">
          <h3>connect with us</h3>
          info @ impresso-project [dot] ch<br>
          github: <a href="https://github.com/impresso"> <b>impresso</b></a><br>
          twitter: <a href="https://twitter.com/impressoproject"> <b>@impressoproject</b></a>
        </div>
        <div class="col-sm-4">
          <h3>other relevant links</h3>
          project <a href="/project/overview/"> overview</a><br>
          project <a href="/consortium#people"> team</a>
        </div>
        <div class="col-sm-4">
          <h3>stay in the loop</h3>
          <p>
            <a class="button" id="chimpSignup" style="padding: 6px 10px; font-size:90%; letter-spacing:1px" href="https://mailchi.mp/1059270fc024/impresso-project" target="_blank">Join our mailing list</a>
          </p>
        </div>
      </div>

      <div class="line my-4"></div>

      <div class="row text-center">
        <div class="col-sm-12">
          <a href="http://www.snf.ch/en/Pages/default.aspx" target="_blank" title="Swiss National Science Foundation">
            <img src="https://impresso-project.ch/assets/images/snf-rgb-e-logo.png">
          </a>
        </div>
      </div>

      <div class="line my-4"></div>

      <div class="row text-center">
        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#snl" title="Swiss National Library, SNL">
              <img src="https://impresso-project.ch/assets/images/snl-logo.png">
            </a>
            <p>Swiss National Library, SNL</p>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#bnl" title="National Library of Luxembourg, BnL.">
              <img src="https://impresso-project.ch/assets/images/bnl-logo.png">
            </a>
            <p>National Library of Luxembourg, BnL.</p>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#aev" title="State Archives of Valais, AEV.">
              <img src="https://impresso-project.ch/assets/images/aev-logo.png">
            </a>
            <p>State Archives of Valais, AEV.</p>
          </div>
        </div>

        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#swa" title="Swiss Economic Archives, SWA.">
              <img src="https://impresso-project.ch/assets/images/unibasel-logo.jpg">
            </a>
            <p>Swiss Economic Archives, SWA.</p>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#le-temps" title="Le Temps">
              <img src="https://impresso-project.ch/assets/images/letemps-logo.svg">
            </a>
            <p>Le Temps</p>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#nzz" title="Neue Zürcher Zeitung, NZZ.">
              <img src="https://impresso-project.ch/assets/images/nzz-logo.png">
            </a>
            <p>Neue Zürcher Zeitung, NZZ.</p>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#unil" title="History department, University of Lausanne, UNIL.">
              <img src="https://impresso-project.ch/assets/images/unil-logo.png">
            </a>
            <p>History department, University of Lausanne, UNIL.</p>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="logo smaller">
            <a href="/consortium/#infoclio" title="infoclio">
              <img src="https://impresso-project.ch/assets/images/infoclio-ch-logo.jpeg">
            </a>
            <p>infoclio</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
footer{
  font-size: smaller;
  color: lighten(black, 50%);
  .logo {
    a{
      display: block;
      margin-bottom: 20px;
      img {
        max-width: 100%;
        max-height: 70px;
      }
    }
  }

  .line{
    border-bottom: 1px solid black;
    &.double{
      border-bottom-width: 2px;
    }
  }
}
</style>
