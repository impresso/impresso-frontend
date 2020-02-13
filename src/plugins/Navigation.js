/**
 * Utility layer on top of `$router`.
 *
 * Exposes two methods that update only provided query parameters
 * leaving others intact.
 */
class Navigation {
  constructor(vue) {
    this.$vue = vue
  }

  /**
   * Update only query parameter defined in `queryParameters`.
   * Not pushed onto history stack.
   * @param {object} queryParameters
   */
  updateQueryParameters(queryParameters = {}) {
    const { query } = this.$vue.$route
    const updatedQuery = Object.assign({}, query, queryParameters)
    return this.$vue.$router.replace({ query: updatedQuery }).catch(() => {})
  }

  /**
   * Update only query parameter defined in `queryParameters`.
   * Pushed onto history stack.
   * @param {object} queryParameters
   */
  updateQueryParametersWithHistory(queryParameters) {
    const { query } = this.$vue.$route
    const updatedQuery = Object.assign({}, query, queryParameters)
    return this.$vue.$router.push({ query: updatedQuery }).catch(() => {})
  }
}

export default {
  install(Vue) {
    Vue.mixin({
      created() {
        this.$navigation = new Navigation(this)
      }
    })
  }
}
