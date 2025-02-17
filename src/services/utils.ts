/**
 * Creates a promise that resolves after a specified timeout or rejects if the timeout is reached.
 *
 * @param {Object} options - The options for the timeout promise.
 * @param {number} [options.ms=500] - The timeout duration in milliseconds.
 * @param {string} [options.service] - The name of the service for which the timeout is set.
 * @param {boolean} [options.silent=true] - If true, the promise resolves silently without rejection on timeout.
 * @returns {Promise<boolean>} A promise that resolves to true after the specified timeout or rejects with an error if not silent.
 */
export const reducedTimeoutPromise = ({
  ms = 500,
  service,
  silent = false
}: {
  ms?: number
  service?: string
  silent?: boolean
}) =>
  new Promise((resolve, reject) => {
    console.debug('[services.utils] reducedTimeoutPromise() called. Params ms:', ms)
    const id = setTimeout(() => {
      clearTimeout(id)
      if (!silent) {
        reject(new Error(`Timed out in ${ms} ms for service: ${service}`))
      }
      resolve(true)
    }, ms)
  })
