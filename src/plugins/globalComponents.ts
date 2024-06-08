import type { Plugin } from "vue"

import BootstrapVueLegacy from './BootstrapVueLegacy'
import ImpressoLayout from './Layout'

const init: Plugin = (app) => {
  BootstrapVueLegacy.install(app)
  ImpressoLayout.install(app)
}

export default init
