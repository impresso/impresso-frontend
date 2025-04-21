import axios, { GenericAbortSignal } from 'axios'

export const fetchJsonData = async <T>(
  url: string,
  stateRef: { value: { data: T | null; status: 'loading' | 'success' | 'error' } },
  signal?: AbortSignal | GenericAbortSignal,
  defaultValue: T | null = null
): Promise<void> => {
  console.debug('[fetchData] Fetching from:', url)
  stateRef.value = { data: defaultValue, status: 'loading' }
  try {
    const response = await axios.get<T>(url, { signal })
    console.info('[fetchData] Response:', response)
    stateRef.value = { data: response.data, status: 'success' }
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      console.warn('[fetchData] Request canceled')
    } else {
      console.error('[fetchData] Error:', error)
      stateRef.value = { data: defaultValue, status: 'error' }
    }
  }
}
