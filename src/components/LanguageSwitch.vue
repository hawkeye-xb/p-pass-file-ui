<template>
  <a-select v-model="currentLang" @change="(value: string | number | boolean | Record<string, any> | (string | number | boolean | Record<string, any>)[]) => handleLanguageChange(value as string)">
    <a-option value="zh">中文</a-option>
    <a-option value="en">English</a-option>
  </a-select>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const currentLang = ref(locale.value)

const handleLanguageChange = (value: string) => {
  locale.value = value as 'zh' | 'en'
  localStorage.setItem('user_language', value)
}
</script>