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
                    //meta: { requiresAuth: true }
                },
                {
                    path: '/config',
                    name: 'configuration',
                    component: () => import('@/views/Config.vue')
                    //meta: { requiresAuth: true }
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
            //meta: { requiresAuth: false } // Esplicito che non richiede auth
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
        },
        //Catch-all others route (must be the last one on the route list)
        {
            path: '/:pathMatch(.*)*',
            name: 'error404',
            component: () => import('@/views/pages/NotFound.vue')
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
