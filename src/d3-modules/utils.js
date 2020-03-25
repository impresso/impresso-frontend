import { schemeCategory10, schemeAccent } from 'd3'

/**
 * @param {string[]} metrics
 * @param {string} metricId
 * @returns {string} hex color string
 */
export function colorForLineMetric(metrics, metricId) {
  const index = metrics.indexOf(metricId)
  if (index < 0) return '#ffffffff'
  return schemeCategory10[index % schemeCategory10.length]
}

/**
 * @param {string[]} metrics
 * @param {string} metricId
 * @returns {string} hex color string
 */
export function colorForAreaMetric(metrics, metricId) {
  const index = metrics.indexOf(metricId)
  if (index < 0) return '#ffffffff'
  return `${schemeAccent[index % schemeAccent.length]}33`
}