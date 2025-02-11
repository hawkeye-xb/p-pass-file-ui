<template>
  <a-switch
    :model-value="isDarkTheme"
    @change="(value: string | number | boolean) => handleThemeChange(value)"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { IconMoon, IconSun } from '@arco-design/web-vue/es/icon'

const isDarkTheme = ref(true)

const setTheme = (theme: 'light' | 'dark') => {
  const dark = theme === 'dark'
  if (dark) {
    document.body.setAttribute('arco-theme', 'dark')
  } else {
    document.body.removeAttribute('arco-theme')
  }
  isDarkTheme.value = dark
}

const handleThemeChange = (value: string | number | boolean) => {
	console.log(value)
  window.electron?.theme.setTheme(value ? 'dark' : 'light')
}

// 监听系统主题变化
const handleThemeChangeFromSystem = (theme: 'light' | 'dark') => {
  setTheme(theme)
}

onMounted(async () => {
  // 获取当前主题
  const currentTheme = await window.electron?.theme.getCurrentTheme()
  if (currentTheme) {
    setTheme(currentTheme)
  }

  // 添加主题变化监听
  window.electron?.theme.onThemeChange(handleThemeChangeFromSystem)
})

onUnmounted(() => {
  // 清理主题变化监听
  window.electron?.theme.removeThemeChangeListener()
})
</script>