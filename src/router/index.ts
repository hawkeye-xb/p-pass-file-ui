import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import Storage from '@/views/storage/Index.vue'
import StorageSetting from '@/views/storage/Settings.vue'
import StorageTransport from '@/views/storage/Transport.vue'

import Usage from '@/views/usage/Index.vue'

import Connections from '@/views/connections/IndexView.vue'
import Folder from '@/views/folder/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/storage',
      name: 'storage',
      component: Storage,
      children: [
        {
          path: 'connections',
          name: 'storage-connections',
          component: Connections,
        },
        {
          path: 'folder',
          name: 'storage-folder',
          component: Folder,
        },
        {
          path: 'transport',
          name: 'storage-transport',
          component: StorageTransport,
        },
        {
          path: 'settings',
          name: 'storage-settings',
          component: StorageSetting,
        }
      ]
    },
    {
      path: '/usage',
      name: 'usage',
      component: Usage,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
