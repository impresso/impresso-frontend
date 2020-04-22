
/**
 * @param {import('vue/types/vue').Vue} vueInstance
 * @param {string} parameter
 * @param {string | undefined} defaultValue
 * @returns {string | undefined}
 */
// eslint-disable-next-line import/prefer-default-export
export function getQueryParameter(vueInstance, parameter, defaultValue = undefined) {
  const value = vueInstance.$route.query[parameter]
  if (value == null) return defaultValue
  if (Array.isArray(value)) {
    console.warn(`"${parameter}" is listed multiple times: ${value}`)
    return /** @type {string | undefined} */ (value[0])
  }
  return value
}

export const CommonQueryParameters = Object.freeze({
  SearchFilters: 'sq',
})
