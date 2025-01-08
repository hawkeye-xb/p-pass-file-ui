<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, type ComputedRef, type Ref } from 'vue';
import { createDir, deleteRes, renameDir, renameFile } from '@/ctrls/index'
import { MetadataTypeDefaultValue, type MetadataType } from '@/types';
import Options from './Options.vue';
import { useMetadatasStore } from '@/stores/metadatas'
import { DOPTION_VALUES, getCurrentFolder } from './utils'
import { handleCreateDir, handleOptionSelected } from './folder'
import { PATH_TYPE } from '@/const';
import { Message } from '@arco-design/web-vue';

const metadataStore = useMetadatasStore();

const breadcrumb: Ref<string[]> = ref([]);
const resetBreadcrumb = () => {
  breadcrumb.value = [];
}
const handleBreadcrumbClick = (name: string) => {
  const index = breadcrumb.value.indexOf(name);
  if (index === -1) { return; }
  breadcrumb.value = breadcrumb.value.slice(0, index + 1);
}

const data: ComputedRef<MetadataType[]> = computed(() => {
  const currentFolder = getCurrentFolder(metadataStore.metadatas, breadcrumb.value);
  return currentFolder?.children?.map((el) => {
    return { ...el, children: undefined }
  }) || [];
});


const cellClick = (record: any) => {
  if (record.type === 'directory') {
    breadcrumb.value.push(record.name)
  } else if (record.type === 'file') {
    // todo: preview file
  }
};

const beforeUploadFile = () => {
  console.log('beforeUploadFile')
}
const handleCreateDirButtonClick = () => {
  if (breadcrumb.value.length === 0) {
    console.warn('breadcrumb.length === 0');
    return;
  }

  const currentFolder = getCurrentFolder(metadataStore.metadatas, breadcrumb.value);
  if (currentFolder.path) {
    handleCreateDir(currentFolder.path);
  }
}

const inputRef = ref<HTMLInputElement | null>(null);
const newName = ref('')
const renameRecord = ref<MetadataType | undefined>(undefined)
const handleRename = async (message: string | number | Record<string, any> | undefined, record: MetadataType) => {
  if (message === DOPTION_VALUES.Rename) {
    renameRecord.value = record;
    newName.value = record.name;
    await nextTick();
    if (inputRef.value) {
      inputRef.value.focus();
    }
  }
}
const resetRenameStatus = () => {
  renameRecord.value = undefined;
  inputRef.value = null;
  newName.value = '';
}
const handleRenameBlurCheck = async () => {
  if (renameRecord.value?.name === newName.value) {
    return resetRenameStatus();
  }

  const record = renameRecord.value;
  if (!record) return;
  const params = {
    target: record?.path,
    name: newName.value,
  }
  const fn = PATH_TYPE.DIR === record.type ? renameDir : renameFile;
  const res = await fn(params);
  const result = await res.json();
  if (res.status !== 200 || result.code !== 0) {
    Message.error(result.message);
    return;
  }
  setTimeout(() => {
    resetRenameStatus();
  }, 100);
}
</script>

<template>
  <div>
    <a-space>
      <a-button type="primary" @click="beforeUploadFile">Upload File</a-button>
      <a-button v-on:click="handleCreateDirButtonClick" :disabled="breadcrumb.length === 0">Create Dir</a-button>
    </a-space>

    <a-divider />

    <div class="dir-main">
      <a-breadcrumb>
        <a-breadcrumb-item v-on:click="resetBreadcrumb">Root</a-breadcrumb-item>
        <a-breadcrumb-item v-for="name in breadcrumb" :key="name" class="home-view-table-breadcrumb-class"
          v-on:click="handleBreadcrumbClick(name)">
          {{ name }}
        </a-breadcrumb-item>
      </a-breadcrumb>

      <!-- dir 还是得提取出来，在move的时候需要，分不同风格的视图 -->
      <a-table :data="data">
        <template #columns>
          <a-table-column title="Name" data-index="mtime">
            <template #cell="{ record }">
              <span v-show="record.ino !== renameRecord?.ino" class="home-view-table-file-name-class"
                v-on:click="cellClick(record)">
                {{ record.name }}
              </span>
              <a-input v-if="record.ino === renameRecord?.ino" ref="inputRef" :style="{ width: '320px' }"
                @blur="handleRenameBlurCheck" @press-enter="handleRenameBlurCheck" v-model="newName"
                placeholder="Please enter new name" allow-clear />
            </template>
          </a-table-column>
          <a-table-column title="Size" data-index="size" :width="180">
            <template #cell="{ record }">
              {{ record.type === 'directory' ? '-' : record.readableSize }}
            </template>
          </a-table-column>
          <a-table-column title="Mtime" data-index="mtime" :width="360">
            <template #cell="{ record }">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>{{ record.mtime }}</div>
                <Options @selected="(k) => {
  handleRename(k, record)
                  handleOptionSelected(k, record)
                }" :record="record" />
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped>
@import url('./index.css')
</style>