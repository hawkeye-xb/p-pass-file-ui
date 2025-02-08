import { createI18n } from 'vue-i18n'
import zhPeer from '../locales/zh/peer.json'
import zhCommon from '../locales/zh/common.json'
import enPeer from '../locales/en/peer.json'
import enCommon from '../locales/en/common.json'
import zhMenu from '../locales/zh/menu.json'
import enMenu from '../locales/en/menu.json'

// 从 localStorage 获取用户语言设置
const STORAGE_LANGUAGE_KEY = 'user_language'
const getStoredLanguage = () => localStorage.getItem(STORAGE_LANGUAGE_KEY) || 'zh'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    zh: {
      menu: zhMenu
    },
    en: {
      menu: enMenu
    }
  }
})

// 语言切换方法
export const setLanguage = (lang: 'zh' | 'en') => {
  i18n.global.locale.value = lang
  localStorage.setItem(STORAGE_LANGUAGE_KEY, lang)
}