import type { App, Component, ComponentCustomProperties } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * Utility layer on top of `$router`.
 *
 * Exposes two methods that update only provided query parameters
 * leaving others intact.
 */
export class Navigation {
  private component: ComponentCustomProperties

  constructor(component: ComponentCustomProperties) {
    this.component = component
  }

  /**
   * Update only query parameter defined in `queryParameters`.
   * Not pushed onto history stack.
   * @param {object} queryParameters
   */
  updateQueryParameters(queryParameters = {}) {
    const { query } = this.component.$route
    const updatedQuery = Object.assign({}, query, queryParameters)
    return this.component.$router.replace({ query: updatedQuery }).catch(() => {})
  }

  /**
   * Update only query parameter defined in `queryParameters`.
   * Pushed onto history stack.
   * @param {object} queryParameters
   */
  updateQueryParametersWithHistory(queryParameters: object) {
    const { query } = this.component.$route
    const updatedQuery = Object.assign({}, query, queryParameters)
    return this.component.$router.push({ query: updatedQuery }).catch(() => {})
  }
}

