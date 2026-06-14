import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path:'/',
      name:'home',
      component:HomeView,
      meta:{
        layout: 'public',
      }
    },
    {
      path:'/login',
      name:'login',
      component:LoginView,
      meta:{
        layout: 'public',
      }
    },
    {
      path:'/signup',
      name:'signup',
      component:SignupView,
      meta:{
        layout: 'public',
      }
    },
    {
      path:'/dashboard',
      name:'dashboard',
      component:DashboardView,
      meta:{
        layout: 'dashboard'
      }
    }
  ]
})

export default router