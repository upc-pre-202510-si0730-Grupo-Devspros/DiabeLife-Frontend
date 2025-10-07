export default [
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('./views/notifications.vue'),
    meta: { 
      title: 'Messages',
      requiresAuth: true,
      layout: 'default'
    }
  }
]