// import { createRouter, createWebHistory } from "vue-router";

// import Control from "./pages/control.vue";
// import Home from "./pages/home.vue";
// import Login from "./pages/login.vue";

// const routes = [
//     {
//         path: "/",
//         name: "Login",
//         component: Login
//     },
//     {
//         path: "/home",
//         name: "Home",
//         component: Home

//     },
//     {
//         path: "/control",
//         name: "Control Panel",
//         component: Control

//     }
// ];

// const router = createRouter({
//     history: createWebHistory(),
//     routes,
// });

// export default router;
import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/control',
                    name: 'control',
                    component: () => import('@/views/Control.vue')
                }
            ]
        },
        // {
        //     path: '/landing',
        //     name: 'landing',
        //     component: () => import('@/views/pages/Landing.vue')
        // },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
