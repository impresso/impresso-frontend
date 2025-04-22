import axios, { GenericAbortSignal } from 'axios'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetches JSON data from a given URL and updates the provided state reference with the result.
 * Includes optional request delay and supports request cancellation.
 *
 * @template T - The type of the data expected in the response.
 * @param {string} url - The URL to fetch data from.
 * @param {{ value: { data: T | null; status: 'loading' | 'success' | 'error' } }} stateRef -
 *   A reference object to hold the state of the fetch operation, including the data and status.
 * @param {AbortSignal | GenericAbortSignal} [signal] - An optional signal to cancel the request.
 * @param {T | null} [defaultValue=null] - The default value to use for the data in case of an error or cancellation.
 * @param {number} [options.requestDelay=100] - An optional delay (in milliseconds) before making the request.
 * @returns {Promise<void>} A promise that resolves when the fetch operation is complete.
 *
 * @example
 * ```typescript
 * const state = { value: { data: null, status: 'loading' } };
 * const controller = new AbortController();
 *
 * fetchJsonData<MyDataType>('https://api.example.com/data', state, controller.signal)
 *   .then(() => {
 *     if (state.value.status === 'success') {
 *       console.log('Data:', state.value.data);
 *     } else if (state.value.status === 'error') {
 *       console.error('Failed to fetch data');
 *     }
 *   });
 *
 * // To cancel the request:
 * controller.abort();
 * ```
 */
export const fetchJsonData = async <T>(
  url: string,
  stateRef: { value: { data: T | null; status: 'loading' | 'success' | 'error' } },
  signal?: AbortSignal | GenericAbortSignal,
  options: {
    defaultValue?: T | null
    requestDelay: number
  } = {
    defaultValue: null, // Default value to use in case of error or cancellation
    requestDelay: 100 // Default delay of 100ms
  }
): Promise<void> => {
  console.debug('[fetchData] Fetching from:', url)
  stateRef.value = { data: options.defaultValue, status: 'loading' }

  try {
    await delay(options.requestDelay) // Add delay before request

    const response = await axios.get<T>(url, { signal })
    console.info('[fetchData] Response:', response)
    stateRef.value = { data: response.data, status: 'success' }
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      console.warn('[fetchData] Request canceled')
    } else {
      console.error('[fetchData] Error:', error)
      stateRef.value = { data: options.defaultValue, status: 'error' }
    }
  }
}
