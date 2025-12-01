export default [
  {
    path: '/appointments',
    name: 'appointments',
    component: () => import('./views/AppointmentManagement.vue'),
    meta: { title: 'Gestión de Citas' }
  }
]