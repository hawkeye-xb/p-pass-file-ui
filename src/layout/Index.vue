<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/Index.vue'
import { initWatchTargets, ws } from '@/services/index'
import { useMetadatasStore } from '@/stores/metadatas'
import { getTransportItem, getWatchTargetsMetadata, TransportDirection } from '@/ctrls/index'
import { useDownloadStore } from '@/stores/download'

const metadataStore = useMetadatasStore();
const downloadStore = useDownloadStore();

// 初始化现在信息
const downloadItems = getTransportItem(TransportDirection.download)
downloadStore.resetDownload(downloadItems)

// 初始化需要监听的 Dir
initWatchTargets()
ws.onmessage = (event) => {
  debounceUpdateMetadatas();
};

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
    <div class="index-layout-header">Header</div>
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
