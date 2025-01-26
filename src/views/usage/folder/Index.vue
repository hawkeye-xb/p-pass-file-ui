<script setup lang="ts">
import { computed, nextTick, ref, type ComputedRef, type Ref } from 'vue';
import { usageRenameDir, usageRenameFile } from '@/ctrls/index'
import { type MetadataType } from '@/types';
import Options from './Options.vue';
import { useMetadatasStore } from '@/stores/metadatas'
import { DOPTION_VALUES, getCurrentFolder } from './utils'
import { handleCreateDir, handleOptionSelected, unlink } from './folder'
import { PATH_TYPE } from '@/const';
import { Message } from '@arco-design/web-vue';
import MoveToModal from './MoveToModal.vue';
import Icon from './Icon.vue';
import { convertBytes, dateFormat } from '@/utils';
import Footer from './Footer.vue';
import { useRouter } from 'vue-router';
import { getConfig } from '@/services';
import { generateUploadRecord, useUploadRecordStore } from '@/stores/usage/uploadRecord';
import { generateDownloadRecord, useDownloadRecordStore } from '@/stores/usage/downloadRecord';

const Router = useRouter();

const metadataStore = useMetadatasStore();
const uploadRecordStore = useUploadRecordStore();
const downloadRecordStore = useDownloadRecordStore();

// breadcrumb
const breadcrumb: Ref<string[]> = ref([]);
const resetBreadcrumb = () => {
  breadcrumb.value = [];
}
const handleBreadcrumbClick = (name: string) => {
  const index = breadcrumb.value.indexOf(name);
  if (index === -1) { return; }
  breadcrumb.value = breadcrumb.value.slice(0, index + 1);
}

// table
const data: ComputedRef<MetadataType[]> = computed(() => {
  const currentFolder = getCurrentFolder(metadataStore.metadatas, breadcrumb.value);
  return currentFolder?.children?.map((el) => {
    const res = { ...el, children: undefined };
    if (breadcrumb.value.length === 0) {
      (res as any).disabled = true;
    }
    return res;
  }).reverse() || [];
});

const selectedKeys = ref<number[]>([]);


const cellClick = (record: any) => {
  if (record.type === 'directory') {
    breadcrumb.value.push(record.name)
  } else if (record.type === 'file') {
    // todo: preview file
  }
};

const beforeUpload = async (option: OpenDialogOptions) => {
  try {
    if (!window.electron) {
      Message.error('上传需要在客户端环境使用');
      return;
    }

    const selector = await window.electron.openFileSelector(option)
    if (selector.canceled) {
      return;
    }
    const currentFolder = getCurrentFolder(metadataStore.metadatas, breadcrumb.value);

    for (const filePath of selector.filePaths) {
      generateUploadRecord(filePath, currentFolder).then(record => {
        if (record) { uploadRecordStore.add(record); }
      });
    }
  } catch (error) {
    console.warn(error)
  }
}
const beforeUploadFile = async () => {
  beforeUpload({
    properties: ['openFile', 'multiSelections'],
  })
}
const beforeUploadDir = async () => {
  beforeUpload({
    properties: ['openDirectory', 'multiSelections'],
  })
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

// rename
const inputRef = ref<HTMLInputElement | null>(null);
const newName = ref('')
const renameRecord = ref<MetadataType | undefined>(undefined)
const handleRename = async (message: string | number | Record<string, any> | undefined, record: MetadataType) => {
  if (message !== DOPTION_VALUES.Rename) {
    return;
  }
  renameRecord.value = record;
  newName.value = record.name;
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
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
  const fn = PATH_TYPE.DIR === record.type ? usageRenameDir : usageRenameFile;
  const res = await fn(params);
  if (res.response.body.code !== 0) {
    Message.error(res.response.body.message);
    return;
  }
  setTimeout(() => {
    resetRenameStatus();
  }, 100);
}

// move src
const moveToVisible = ref(false)
const moveSrc = ref<string[]>([])

// option
const handleMoveTo = (k: string | number | Record<string, any> | undefined, src: string[]) => {
  if (k !== DOPTION_VALUES.MoveTo) {
    return;
  }
  moveToVisible.value = true;
  moveSrc.value = src; // 设置单个，批量操作再设置多个
}
const handleDownload = async (k: string | number | Record<string, any> | undefined, record: MetadataType) => {
  if (k !== DOPTION_VALUES.Download) {
    return;
  }
  if (!window.electron) {
    Message.error('下载需要在客户端环境使用');
    return;
  }
  const selector = await window.electron.openFileSelector({
    properties: ['openDirectory'],
  })
  if (selector.canceled) {
    return;
  }
  const target = selector.filePaths[0];

  const item = generateDownloadRecord(record, target) // todo: ? record 怎么会有children呢。。
  if (!item) {
    return;
  }
  downloadRecordStore.add(item);
}
const handleCellOptionSelected = (k: string | number | Record<string, any> | undefined, record: any) => {
  const currentFolder = getCurrentFolder(metadataStore.metadatas, breadcrumb.value);
  const srcRecord = currentFolder.children?.find((el) => el.ino === record.ino);

  handleMoveTo(k, [record.path])
  handleRename(k, record)
  srcRecord && handleDownload(k, srcRecord)
  handleOptionSelected(k, record)
}

// footer
const handleBatchOptions = async (action: DOPTION_VALUES) => {
  const selectedValue = data.value.filter((el) => selectedKeys.value.includes(el.ino));

  if (action === DOPTION_VALUES.Delete) {
    unlink(selectedValue.map(el => el.path));
  }
  if (action === DOPTION_VALUES.MoveTo) {
    moveToVisible.value = true;
    moveSrc.value = selectedValue.map(el => el.path);
  }
  if (action === DOPTION_VALUES.Download) {
    if (!window.electron) {
      Message.error('下载需要在客户端环境使用');
      return;
    }
    const selector = await window.electron.openFileSelector({
      properties: ['openDirectory'],
    })
    if (selector.canceled) {
      return;
    }
    const target = selector.filePaths[0];
    selectedValue.forEach(selected => {
      const item = metadataStore.findMetadataByIno(metadataStore.metadatas, selected.ino);
      if (item) {
        const record = generateDownloadRecord(item, target);
        if (record) {
          downloadRecordStore.add(record);
        }
      }
    })
  }

  selectedKeys.value = [];
}

// alert
const alertVisible = ref(false)
const connDeviceId = getConfig('connDeviceId')
alertVisible.value = !connDeviceId;
</script>

<template>

  <div style="position: relative; flex: 1;">
    <a-alert type="warning" v-if="alertVisible">
      Please set the id of the connected device to obtain data.
      <a-link @click="() => { Router.push('/usage/settings') }">
        go to settings
      </a-link>
    </a-alert>
    <a-space style="margin: 8px 16px;">
      <a-button type="primary" @click="beforeUploadFile" :disabled="breadcrumb.length === 0">Upload File</a-button>
      <a-button type="primary" @click="beforeUploadDir" :disabled="breadcrumb.length === 0">Upload Folder</a-button>
      <a-button v-on:click="handleCreateDirButtonClick" :disabled="breadcrumb.length === 0">Create Dir</a-button>
    </a-space>

    <div class="dir-main">
      <a-breadcrumb>
        <a-breadcrumb-item v-on:click="resetBreadcrumb">
          <span class="home-view-table-breadcrumb-class">Roots</span>
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="name in breadcrumb" :key="name" v-on:click="handleBreadcrumbClick(name)">
          <span class="home-view-table-breadcrumb-class">{{ name }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>

      <a-table :data="data" row-key="ino" :row-selection="{
        type: 'checkbox',
        showCheckedAll: true,
        onlyCurrent: true,
      }" :pagination="{
        defaultPageSize: 15
      }" v-model:selectedKeys="selectedKeys">
        <template #columns>
          <a-table-column title="Name" data-index="name" :sortable="{
            sortDirections: ['descend', 'ascend'],
          }">
            <template #cell="{ record }">
              <span v-show="record.ino !== renameRecord?.ino" class="home-view-table-file-name-class"
                v-on:click="cellClick(record)">
                <Icon :type="record.type" :path="record.path" />
                {{ record.name }}
              </span>
              <a-input v-if="record.ino === renameRecord?.ino" ref="inputRef"
                :style="{ width: '320px', margin: '-10px 0 -10px -10px' }" @blur="handleRenameBlurCheck"
                @press-enter="handleRenameBlurCheck" v-model="newName" placeholder="Please enter new name"
                allow-clear />
            </template>
          </a-table-column>
          <a-table-column title="Size" data-index="size" :width="180" :sortable="{
            sortDirections: ['descend', 'ascend'],
          }">
            <template #cell="{ record }">
              {{ record.type === 'directory' ? '-' : convertBytes(Number(record.size)) }}
            </template>
          </a-table-column>
          <a-table-column title="Mtime" data-index="mtime" :width="360" :sortable="{
            sortDirections: ['descend', 'ascend'],
          }">
            <template #cell="{ record }">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>{{ dateFormat(record.mtime) }}</div>
                <Options v-if="breadcrumb.length > 0" @selected="(k) => {
                  handleCellOptionSelected(k, record)
                }" :record="record" />
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- MoveToModal -->
    <MoveToModal v-model:visible="moveToVisible" :src="moveSrc" />
    <Footer v-show="selectedKeys.length > 0" @selected="handleBatchOptions" />
  </div>
</template>

<style scoped>
@import url('./index.css');
</style>