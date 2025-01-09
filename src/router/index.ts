import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Connections from '../views/connections/IndexView.vue'
import FinderView from '../views/folder/Index.vue'
import Transport from '@/views/transport/IndexView.vue'
import TransportUpload from '@/views/transport/UploadView.vue'
import TransportDownload from '@/views/transport/DownloadView.vue'
import Settings from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/connections',
      name: 'connections',
      component: Connections,
    },
    {
      path: '/folder',
      name: 'folder',
      component: FinderView,
    },
    {
      path: '/transport',
      name: 'transport',
      component: Transport,
      children: [
        {
          path: 'upload',
          name: 'upload',
          component: TransportUpload,
        },
        {
          path: 'download',
          name: 'download',
          component: TransportDownload,
        },
      ]
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
