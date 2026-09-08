import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Review from '../views/Review.vue';
import AddSentence from '../views/AddSentence.vue';
import Library from '../views/Library.vue';
import VerifyEmail from '../views/auth/VerifyEmail.vue';
import Profile from '../views/profile/index.vue';
import NotFound from '@/composables/404.vue';
import Groups from '@/views/groups/index.vue';
import GroupCreate from '@/views/groups/Create.vue';
import GroupDetail from '@/views/groups/Detail.vue';
import GroupJoin from '@/views/groups/Join.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/verify-email', component: VerifyEmail, meta: { requiresAuth: false } },
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/review', component: Review, meta: { requiresAuth: true } },
  { path: '/add', component: AddSentence, meta: { requiresAuth: true } },
  { path: '/library', component: Library, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/groups', component: Groups, meta: { requiresAuth: true } },
  { path: '/groups/create', component: GroupCreate, meta: { requiresAuth: true } },
  { path: '/groups/:id', component: GroupDetail, meta: { requiresAuth: true } },
  { path: '/groups/join', component: GroupJoin, meta: { requiresAuth: true } },

  // Catch all route for 404 errors
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
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