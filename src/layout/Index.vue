<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/Index.vue'
import { initWatchTargets, ws } from '@/services/index'
import { useMetadatasStore } from '@/stores/metadatas'
import { getDownloadItems, getDownloadQueueItems, getWatchTargetsMetadata } from '@/ctrls/index'
import { useDownloadStore } from '@/stores/download'
import { useLinkStore } from '@/stores/link'
import StatusBar from '@/components/LayoutHeaderStatusBar.vue'

const metadataStore = useMetadatasStore();
const downloadStore = useDownloadStore();
const linkStore = useLinkStore();

// 初始化现在信息
downloadStore.resetDownload(getDownloadItems())
downloadStore.resetDownloadQueue(getDownloadQueueItems())

// 初始化需要监听的 Dir
initWatchTargets()

linkStore.updateLink('ws', 'processing') // 重连呢？
ws.onmessage = (event) => {
  debounceUpdateMetadatas();
};
ws.onopen = () => { linkStore.updateLink('ws', 'success') }
ws.onclose = () => { linkStore.updateLink('ws', 'warning') }
ws.onerror = () => { linkStore.updateLink('ws', 'danger') }

let timer: number | null | undefined = null;
function debounceUpdateMetadatas() {
  if (timer) {
    clearInterval(timer)
  }

  timer = setTimeout(() => {
    updateMetadatas();
  }, 20)
}

async function updateMetadatas() {
  const res = await getWatchTargetsMetadata();
  const result = await res.json();
  if (result.code !== 200) {
    return;
  }
  metadataStore.updateMetadatas(result.data)
}
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
