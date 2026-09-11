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
import MyGroups from '@/views/groups/MyGroups.vue';
import GroupCreate from '@/views/groups/Create.vue';
import GroupDetail from '@/views/groups/Detail.vue';
import GroupJoin from '@/views/groups/Join.vue';

const routes = [
  // 公开页面（未登录可访问）
  { path: '/login', component: Login, meta: { requiresAuth: false, guestOnly: true } },
  { path: '/register', component: Register, meta: { requiresAuth: false, guestOnly: true } },
  { path: '/verify-email', component: VerifyEmail, meta: { requiresAuth: false, guestOnly: true } },

  // 需要登录的页面
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/review', component: Review, meta: { requiresAuth: true } },
  { path: '/add', component: AddSentence, meta: { requiresAuth: true } },
  { path: '/library', component: Library, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/mygroups', component: MyGroups, meta: { requiresAuth: true } },
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

  // 1. 需要登录但未登录 → 跳转登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
    return;
  }

  // 2. 已登录但访问游客专用页面（登录/注册/验证） → 跳转首页
  if (to.meta.guestOnly && isLoggedIn) {
    next('/');
    return;
  }

  // 3. 正常放行
  next();
});

export default router;