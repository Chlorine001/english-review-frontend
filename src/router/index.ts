import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Review from '../views/Review.vue';
import AddSentence from '../views/AddSentence.vue';
import Library from '../views/Library.vue';
import VerifyEmail from '../views/VerifyEmail.vue';
import Profile from '@/views/Profile.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/review', component: Review, meta: { requiresAuth: true } },
  { path: '/add', component: AddSentence, meta: { requiresAuth: true } },
  { path: '/library', component: Library, meta: { requiresAuth: true } },
  { path: '/verify-email', component: VerifyEmail, meta: { requiresAuth: false } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;