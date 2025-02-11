<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/StorageMenu.vue'
import StatusBar from '@/components/LayoutHeaderStatusBar.vue'
import { IconSettings, IconUser } from '@arco-design/web-vue/es/icon'
import { storageService } from '@/services/storage/main'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

storageService()
</script>

<template>
  <div class="index-layout">
    <a-page-header :style="{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-neutral-3)' }"
      title="P-Pass File" :show-back="false">
      <template #subtitle>
        <StatusBar :style="{ paddingLeft: '24px' }" />
      </template>
      <template #extra>
        <div>
          <a-space>
						<LanguageSwitch />
            <RouterLink to="/storage/settings">
              <a-button shape="circle">
                <IconSettings />
              </a-button>
            </RouterLink>

            <!-- <a-avatar :style="{ backgroundColor: '#3370ff' }">
              <IconUser />
            </a-avatar> -->
          </a-space>
        </div>
      </template>
    </a-page-header>
    <div class="index-layout-body">
      <Menu style="border-right: 1px solid var(--color-neutral-3)" />
      <RouterView />
    </div>
  </div>
</template>
<style scoped>
@import url('@/assets/layout.css');
</style>