import { createRouter, createWebHistory } from "vue-router";

import Control from "./pages/control.vue";
import Home from "./pages/home.vue";
import Login from "./pages/login.vue";

const routes = [
    {
        path: "/",
        name: "Login",
        component: Login
    },
    {
        path: "/home",
        name: "Home",
        component: Home

    },
    {
        path: "/control",
        name: "Control Panel",
        component: Control

    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;