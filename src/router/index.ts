import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import Storage from '@/views/storage/Index.vue'
import StorageSettings from '@/views/storage/Settings.vue'
import StorageFolder from '@/views/storage/Folder.vue'
import StorageTransport from '@/views/storage/Transport.vue'

import Usage from '@/views/usage/Index.vue'
import UsageSettings from '@/views/usage/Settings.vue'
import UsageTransport from '@/views/usage/Transport.vue'
import UsageFolder from '@/views/usage/folder/Index.vue'

import Connections from '@/views/connections/IndexView.vue'


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
          component: StorageFolder,
        },
        {
          path: 'transport',
          name: 'storage-transport',
          component: StorageTransport,
        },
        {
          path: 'settings',
          name: 'storage-settings',
          component: StorageSettings,
        }
      ]
    },
    {
      path: '/usage',
      name: 'usage',
      component: Usage,
      children: [
        {
          path: 'settings',
          name: 'usage-settings',
          component: UsageSettings,
        },
        {
          path: 'connections',
          name: 'usage-connections',
          component: Connections,
        },
        {
          path: 'folder',
          name: 'usage-folder',
          component: UsageFolder,
        },
        {
          path: 'transport',
          name: 'usage-transport',
          component: UsageTransport,
        },
      ]
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
