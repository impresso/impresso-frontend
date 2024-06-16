import { useSettingsStore } from "@/stores/settings"
import { createI18n } from 'vue-i18n'
import datetimeFormats from '@/i18n/dateTimeFormats'
import numberFormats from '@/i18n/numberFormats'
import messages from '@/i18n/messages'

export const newI18n = () => {
  const settingsStore = useSettingsStore()

  return createI18n({
    legacy: true,
    fallbackLocale: 'en',
    locale: settingsStore.language_code,
    datetimeFormats: datetimeFormats as any,
    numberFormats: numberFormats as any,
    sharedMessages: messages,
    escapeMessage: false,
    escapeParameterHtml: false,
    warnHtmlInMessage: 'off', // better remove HTML and disable this
    silentFallbackWarn: true,
    silentTranslationWarn: true, // setting this to `true` hides warn messages about translation keys.
  })
}
