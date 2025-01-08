<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/Index.vue'
import { initWatchTargets, ws } from '@/services/index'
import { useMetadatasStore } from '@/stores/metadatas'
import { getWatchTargetsMetadata } from '@/ctrls/index'

const metadataStore = useMetadatasStore();

initWatchTargets()  // 初始化需要监听的 Dir
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
    <Menu />
    <RouterView style="flex: 1;" />
  </div>
</template>

<style scoped>
.index-layout {
  display: flex;
  height: 100%;
}
</style>
