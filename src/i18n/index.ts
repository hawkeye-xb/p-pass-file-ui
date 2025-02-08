import { createI18n } from 'vue-i18n'
import zhPeer from '../locales/zh/peer.json'
import zhCommon from '../locales/zh/common.json'
import zhMenu from '../locales/zh/menu.json'
import zhSettings from '../locales/zh/settings.json'
import enPeer from '../locales/en/peer.json'
import enCommon from '../locales/en/common.json'
import enMenu from '../locales/en/menu.json'
import enSettings from '../locales/en/settings.json'
import zhStatus from '../locales/zh/status.json'
import enStatus from '../locales/en/status.json'
import zhFolder from '../locales/zh/folder.json'
import zhTransport from '../locales/zh/transport.json'
import enFolder from '../locales/en/folder.json'
import enTransport from '../locales/en/transport.json'

// 从 localStorage 获取用户语言设置
const STORAGE_LANGUAGE_KEY = 'user_language'
const getStoredLanguage = () => localStorage.getItem(STORAGE_LANGUAGE_KEY) || 'zh'

export const i18n = createI18n({
  legacy: false,
  locale: getStoredLanguage(),
  fallbackLocale: 'en',
  messages: {
    zh: {
      peer: zhPeer,
      common: zhCommon,
      menu: zhMenu,
      settings: zhSettings,
      status: zhStatus,
      folder: zhFolder,
      transport: zhTransport
    },
    en: {
      peer: enPeer,
      common: enCommon,
      menu: enMenu,
      settings: enSettings,
      status: enStatus,
      folder: enFolder,
      transport: enTransport
    }
  }
})

// 语言切换方法
export const setLanguage = (lang: 'zh' | 'en') => {
  i18n.global.locale.value = lang
  localStorage.setItem(STORAGE_LANGUAGE_KEY, lang)
}