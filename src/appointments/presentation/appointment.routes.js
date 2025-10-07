export default [
  {
    path: '/appointments',
    name: 'appointments',
    component: () => import('./views/appointment.vue'),
    meta: { title: 'Appointments' }
  }
]