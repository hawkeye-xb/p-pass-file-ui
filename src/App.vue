<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { getConfig, setConfig } from '@/services/index'
import SetClientType from './components/SetClientType.vue';
import { onBeforeUnmount } from 'vue';

const initConfig = () => {
  const deviceId = getConfig('deviceId') || uuidv4();
  setConfig('deviceId', deviceId)

  console.log('deviceId: ', deviceId)
}
initConfig()

// @ts-ignore
if (window.electron) { console.log('electron', window.electron) }

onBeforeUnmount(() => {
  console.log('onBeforeUnmount')
})
</script>

<template>
  <SetClientType />
  <RouterView />
</template>
