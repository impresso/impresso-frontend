import { useSettingsStore } from '@/stores/settings'
import { createI18n } from 'vue-i18n'
import datetimeFormats from '@/i18n/dateTimeFormats'
import numberFormats from '@/i18n/numberFormats'
import messages from '@/i18n/messages'

export const newI18n = () => {
  const settingsStore = useSettingsStore()

  console.debug(
    '[i18n] createI18n \n settingsStore.language_code:',
    settingsStore.language_code,
    '\n datetimeFormats:',
    datetimeFormats,
    '\n numberFormats:',
    numberFormats
  )
  return createI18n({
    legacy: true,
    fallbackLocale: 'en',
    globalInjection: true,
    locale: settingsStore.language_code,
    datetimeFormats: datetimeFormats as any,
    numberFormats: numberFormats as any,
    sharedMessages: messages,
    escapeMessage: false,
    escapeParameterHtml: false,
    warnHtmlInMessage: 'off', // better remove HTML and disable this
    silentFallbackWarn: true,
    silentTranslationWarn: true // setting this to `true` hides warn messages about translation keys.
  })
}
