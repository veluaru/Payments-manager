import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/orders'
    },
    {
      path: '/orders',
      name: 'orders-list',
      component: () => import('../views/OrdersListView.vue')
    },
    {
      path: '/orders/create',
      name: 'order-create',
      component: () => import('../views/OrderCreateView.vue')
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('../views/OrderDetailView.vue'),
      props: true 
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ],
})

export default router
