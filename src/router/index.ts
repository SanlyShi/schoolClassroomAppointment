import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/appointment'
  },
  {
    path: '/login/:schoolId',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/:schoolId/login',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/home.vue'),
    children:[
      {
        path: '/appointment',
        name: 'appointment',
        component: () => import('../views/appointment.vue')
      },
      {
        path: '/bookingRoom',
        name: 'bookingRoom',
        component: () => import('../views/bookingRoom.vue')
      },
      {
        path: '/appointmentDetail',
        name: 'appointmentDetail',
        component: () => import('../views/appointmentDetail.vue')
      },
      {
        path: '/attendanceRecord',
        name: 'attendanceRecord',
        component: () => import('../views/attendanceRecord.vue')
      },
      {
        path: '/joinRecord',
        name: 'joinRecord',
        component: () => import('../views/joinRecord.vue')
      }
    ]
  },
]

const router = new VueRouter({
    base: 'jsyyadmin',
    mode: 'history',
    routes
})

export default router
