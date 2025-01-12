<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/Index.vue'
import StatusBar from '@/components/LayoutHeaderStatusBar.vue'
import { IconSettings, IconUser } from '@arco-design/web-vue/es/icon';

import { initDownload } from './initDownload';

initDownload() // download
</script>

<template>
  <div class="index-layout">
    <a-page-header :style="{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-neutral-3)' }"
      title="Pigeon" :show-back="false">
      <template #subtitle>
        <StatusBar :style="{ paddingLeft: '24px' }" />
      </template>
      <template #extra>
        <div>
          <a-space>
            <RouterLink to="/settings">
              <a-button shape="circle">
                <IconSettings />
              </a-button>
            </RouterLink>

            <a-avatar :style="{ backgroundColor: '#3370ff' }">
              <IconUser />
            </a-avatar>
          </a-space>
        </div>
      </template>
    </a-page-header>
    <div class="index-layout-body">
      <Menu style="border-right: 1px solid var(--color-neutral-3)" />
      <RouterView style="flex: 1;" />
    </div>
  </div>
</template>

<style scoped>
.index-layout {
  display: flex;
  height: 100%;
  flex-direction: column;
  }
  
  .index-layout-header {
    box-sizing: border-box;
    height: 64px;
    /* background-color: var(--color-neutral-3); */
    border-bottom: 1px solid var(--color-neutral-3);
  }
  
  .index-layout-body {
    flex: 1;
    display: flex;
}
</style>
