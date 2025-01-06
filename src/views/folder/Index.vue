<script setup lang="ts">
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue';
import { createDir, getWatchTargetsMetadata } from '@/ctrls/index'
import { MetadataTypeDefaultValue, type MetadataType } from '@/types';

const allMetadData: Ref<MetadataType[]> = ref([]);

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
  const currentFolder = getCurrentFolder(allMetadData.value, breadcrumb.value);
  return currentFolder?.children?.map((el) => {
    return { ...el, children: undefined }
  }) || [];
});
function getCurrentFolder(metadatas: MetadataType[], names: string[]) {
  let currentFolder: MetadataType | null = null;
  for (const name of names) {
    const node = metadatas.find((el: { name: string; }) => el.name === name);
    if (node) {
      currentFolder = node;
      metadatas = node.children || [];
    } else {
      break;
    }
  }

  return currentFolder || {
    ...MetadataTypeDefaultValue,
    children: metadatas,
  };
}

const cellClick = (record: any) => {
  if (record.type === 'directory') {
    breadcrumb.value.push(record.name)
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

  const currentFolder = getCurrentFolder(allMetadData.value, breadcrumb.value);
  if (currentFolder.path) {
    handleCreateDir(currentFolder.path);
  }
}

async function handleCreateDir(target: string) {
  const res = await createDir({
    target,
    name: '新建文件夹' + new Date(),
  });
  const result = await res.json();
  if (result.code !== 200) {
    return;
  }
}

// todo: delete
async function getWatchMetadata() {
  const res = await getWatchTargetsMetadata();
  const result = await res.json();
  if (result.code !== 200) {
    return;
  }
  allMetadData.value = result.data;
}
onMounted(() => {
  getWatchMetadata();
});
</script>

<template>
  <div>
    <a-space>
      <a-button type="primary" @click="beforeUploadFile">Upload File</a-button>
      <a-button v-on:click="handleCreateDirButtonClick" :disabled="breadcrumb.length === 0">Create Dir</a-button>
    </a-space>

    <a-divider />

    <!-- dir -->
    <div class="dir-main">
      <a-breadcrumb>
        <a-breadcrumb-item v-on:click="resetBreadcrumb">Root</a-breadcrumb-item>
        <a-breadcrumb-item v-for="name in breadcrumb" :key="name" class="home-view-table-breadcrumb-class"
          v-on:click="handleBreadcrumbClick(name)">
          {{ name }}
        </a-breadcrumb-item>
      </a-breadcrumb>

      <a-table :data="data">
        <template #columns>
          <a-table-column title="Name" data-index="mtime">
            <template #cell="{ record }">
              <span class="home-view-table-file-name-class" v-on:click="cellClick(record)">
                {{ record.name }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="Size" data-index="size" :width="180">
            <template #cell="{ record }">
              {{ record.type === 'directory' ? '-' : record.readableSize }}
            </template>
          </a-table-column>
          <a-table-column title="Mtime" data-index="mtime" :width="360"></a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped>
.arco-table-td-content .home-view-table-file-name-class,
.arco-breadcrumb .home-view-table-breadcrumb-class {
  cursor: pointer;
}

.arco-table-td-content .home-view-table-file-name-class:hover,
.arco-breadcrumb .home-view-table-breadcrumb-class:hover {
  color: rgb(var(--primary-6));
}

/* todo */
/* .dir-main .arco-breadcrumb-item */
.dir-main .arco-icon {
  cursor: pointer;
}

.dir-main .arco-icon:hover {
  color: rgb(var(--primary-6));
}
</style>