import { ImpressoDataProvider, ImpressoGlobalMetadata } from '@/models/ImpressoMetadata'

export class DataProvidersService {
  /**
   * Return data provider name by its id.
   * If locale is not provided, browser locale is used.
   * @param id
   * @param locale
   */
  getDataProviderNameById(id: string, locale?: string): string | undefined {
    // Data providers list is in `glob.impressoDataProviders`
    const glob = window as unknown as ImpressoGlobalMetadata
    if (!glob.impressoDataProviders) {
      return undefined
    }

    // Find the data provider by id
    const dataProvider = glob.impressoDataProviders.find(
      (provider: ImpressoDataProvider) => provider.id === id
    )
    if (!dataProvider) {
      return undefined
    }

    // If no names are available, return undefined
    if (!dataProvider.names || !dataProvider.names.length) {
      return undefined
    }

    // Determine which locale to use
    const userLocale = locale || navigator.language || 'en'
    const shortLocale = userLocale.split('-')[0] // Get the language code without region

    // First try to find an exact match for the full locale
    let name = dataProvider.names.find(n => n.langCode === userLocale)?.name

    // If not found, try to find a match for the language code
    if (!name) {
      name = dataProvider.names.find(n => n.langCode === shortLocale)?.name
    }

    // If still not found, use English or the first available name
    if (!name) {
      name = dataProvider.names.find(n => n.langCode === 'en')?.name || dataProvider.names[0]?.name
    }

    return name
  }
}
