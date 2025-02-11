<template>
  <a-switch
    :model-value="isDarkTheme"
    @change="(value: string | number | boolean) => handleThemeChange(value as boolean)"
    :default-checked="true"
  >
    <template #checked>
      <icon-moon />
    </template>
    <template #unchecked>
      <icon-sun />
    </template>
  </a-switch>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconMoon, IconSun } from '@arco-design/web-vue/es/icon'

const isDarkTheme = ref(true)

const setTheme = (dark: boolean) => {
  if (dark) {
    document.body.setAttribute('arco-theme', 'dark')
  } else {
    document.body.removeAttribute('arco-theme')
  }
  localStorage.setItem('theme_mode', dark ? 'dark' : 'light')
  isDarkTheme.value = dark
}

const handleThemeChange = (value: boolean) => {
  setTheme(value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme_mode')
  setTheme(savedTheme === 'light' ? false : true) // 默认使用暗色主题
})
</script>