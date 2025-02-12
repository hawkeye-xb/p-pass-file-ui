<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getConfig, setConfig, ClientType } from '@/services/index';
import { IconCopy } from '@arco-design/web-vue/es/icon';
import { Message, Modal } from '@arco-design/web-vue';
import LanguageSwitch from '@/components/LanguageSwitch.vue'
import { useI18n } from 'vue-i18n';
import { themeService } from '@/services/theme';

const { t } = useI18n();

// 添加设备类型相关的代码
const currentClientType = ref<ClientType>(getConfig('clientType') || ClientType.Storage);

const handleClientTypeChange = (value: string | number) => {
  // 如果点击的是当前类型，直接返回
  if (value === currentClientType.value) {
    return;
  }

  Modal.warning({
    title: t('settings.clientType.confirmTitle'),
    content: t('settings.clientType.confirmContent'),
    okText: t('settings.common.confirm'),
    cancelText: t('settings.common.cancel'),
    closable: true,
    maskClosable: true,
    onOk: () => {
      setConfig('clientType', value as ClientType);
      window.electron?.relaunchApp();
    }
  });
};

const deviceId = ref('')
deviceId.value = getConfig('deviceId') || '';

const handleCopyDeviceId = () => {
	const input = document.createElement('input');
	input.value = deviceId.value;
	document.body.appendChild(input);
	input.select();
	document.execCommand('copy');
	document.body.removeChild(input);

	Message.success(t('settings.deviceId.copy.success'));
}

// 主题设置相关
const currentTheme = ref<'system' | 'light' | 'dark'>('system');

const handleThemeChange = (value: 'system' | 'light' | 'dark') => {
  currentTheme.value = value;
  window.electron?.theme.setTheme(value);
  if (value !== 'system') {
    themeService.setTheme(value);
  }
}

onMounted(async () => {
  const theme = await window.electron?.theme.getCurrentTheme();
  if (theme) {
    themeService.setTheme(theme);
    currentTheme.value = theme;
  }
});

</script>

<template>
  <!-- 添加设备类型选择器，放在最上面 -->
  <div class="settings-list-item">
    <div class="settings-list-item-label">{{ t('settings.clientType.label') }}</div>
    <div class="">
      <div class="client-type-switch">
        <div
          class="client-type-option"
          :class="{ active: currentClientType === 'storage' }"
          @click="handleClientTypeChange('storage')"
        >
          {{ t('settings.clientType.storage') }}
        </div>
        <div
          class="client-type-option"
          :class="{ active: currentClientType === 'usage' }"
          @click="handleClientTypeChange('usage')"
        >
          {{ t('settings.clientType.usage') }}
        </div>
      </div>
    </div>
  </div>

  <div class="settings-list-item">
    <div class="settings-list-item-label">{{ t('settings.deviceId.label') }}</div>
    <div class="settings-list-item-content">
      <div>{{ deviceId }}</div>
    </div>
    <a-space class="settings-list-item-options">
      <a-tooltip :content="t('settings.deviceId.copy.tooltip')">
        <a-button @click="handleCopyDeviceId">
          <template #icon>
            <IconCopy />
          </template>
        </a-button>
      </a-tooltip>
    </a-space>
  </div>

	<div class="settings-list-item">
    <div class="settings-list-item-label">{{ t('settings.language.label') }}</div>
    <div class="settings-list-item-content" style="padding: 0;">
			<LanguageSwitch />
    </div>
  </div>

  <!-- 主题设置部分 -->
  <div class="settings-list-item theme-settings">
    <div class="settings-list-item-label">{{ t('settings.theme.label') }}</div>
    <div class="settings-list-item-content">
      <div class="theme-options">
        <div
          class="theme-option"
          :class="{ active: currentTheme === 'light' }"
          @click="handleThemeChange('light')"
        >
          <div class="theme-preview light-preview">
            <div class="preview-header">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <div class="preview-content"></div>
          </div>
          <span class="theme-label">{{ t('settings.theme.light') }}</span>
        </div>

        <div
          class="theme-option"
          :class="{ active: currentTheme === 'dark' }"
          @click="handleThemeChange('dark')"
        >
          <div class="theme-preview dark-preview">
            <div class="preview-header">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <div class="preview-content"></div>
          </div>
          <span class="theme-label">{{ t('settings.theme.dark') }}</span>
        </div>

        <div
          class="theme-option"
          :class="{ active: currentTheme === 'system' }"
          @click="handleThemeChange('system')"
        >
          <div class="theme-preview system-preview">
            <div class="preview-split">
              <div class="preview-header light">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
              <div class="preview-header dark">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
          <span class="theme-label">{{ t('settings.theme.system') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
@import url('@/assets/settings.css');

.theme-options {
  display: flex;
  gap: 20px;
}

.theme-option {
  cursor: pointer;
  text-align: center;
  opacity: 0.6;
  transition: all 0.3s;
}

.theme-option:hover,
.theme-option.active {
  opacity: 1;
}

.theme-option.active .theme-preview {
  border: 1px solid rgb(var(--primary-5));
}

.theme-preview {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  border: 1px solid var(--color-border-2);
  margin-bottom: 8px;
  overflow: hidden;
}

.preview-header {
  height: 16px; /* 调整标题栏高度 */
  background: var(--color-bg-2);
  display: flex;
  align-items: center;
  padding: 0 6px;
  gap: 4px;
}

.preview-content {
  height: calc(100% - 16px);
  background: var(--color-bg-1);
}

.dot {
  width: 4px; /* 调整点的大小 */
  height: 4px;
  border-radius: 50%;
  background: var(--color-text-4);
}

.dark-preview {
  background: #1d1d1d;
}

.dark-preview .preview-header {
  background: #2b2b2b;
}

.system-preview .preview-split {
  display: flex;
}

.system-preview .preview-header {
  width: 50%;
}

.system-preview .preview-header.dark {
  background: #2b2b2b;
}

.theme-label {
  font-size: 13px;
  color: var(--color-text-2);
  margin-top: 4px;
  display: block;
}

/* 添加设备类型选择器的样式 */
:deep(.arco-tabs) {
  margin: 8px 0;
}

:deep(.arco-tabs-nav) {
  margin-bottom: 0;
}
</style>