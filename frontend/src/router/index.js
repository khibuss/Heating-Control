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
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/control',
                    name: 'control',
                    component: () => import('@/views/Control.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/config',
                    name: 'configuration',
                    component: () => import('@/views/Config.vue'),
                    meta: { requiresAuth: true }
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
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: { requiresAuth: false } // Esplicito che non richiede auth
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

// Funzione per validare il token con il backend
async function validateToken(token) {
    console.log(token);
    try {
        const response = await fetch('http://localhost:8000/api/validate-token', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) return true;
        else return false;
    } catch (error) {
        return false;
    }
}

router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('admin_token');

    // Se la rotta non richiede autenticazione, procedi
    if (!to.meta.requiresAuth) {
        next();
        return;
    }

    // Se non c'è token, reindirizza al login
    if (!token) {
        next({ name: 'login' });
        return;
    }

    // Verifica la validità del token con il backend
    const isValid = await validateToken(token);
    //console.log(isValid);

    if (isValid) {
        // Token valido - procedi

        next();
    } else {
        // Token non valido - cancella il token e reindirizza
        localStorage.removeItem('admin_token');
        next({ name: 'login' });
    }
});

export default router;
