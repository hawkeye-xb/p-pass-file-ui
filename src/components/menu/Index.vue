<script setup lang="ts">
import {
  IconFolder,
  IconSettings,
  IconApps,
} from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';

const Router = useRouter();

</script>

<template>
  <a-menu :style="{
      width: '200px',
      height: '100%',
    }" show-collapse-button breakpoint="xl">
    <a-menu-item key="conn" v-on:click="() => { }">
      <template #icon>
        <IconApps></IconApps>
      </template>
      Connections
    </a-menu-item>
    <a-menu-item key="storage-folder" v-on:click="() => { Router.push('/folder') }">
      <template #icon>
        <IconFolder></IconFolder>
      </template>
      Folder
    </a-menu-item>
    <a-menu-item key="settings" v-on:click="() => { Router.push('/settings') }">
      <template #icon>
        <IconSettings></IconSettings>
      </template>
      Settings
    </a-menu-item>
  </a-menu>
</template>
