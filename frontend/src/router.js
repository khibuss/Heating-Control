import { createRouter, createWebHistory } from "vue-router";
//IMPORTARE COMPONENT
import Heating from "./pages/heating.vue";

const routes = [
    {
        path: "/",
        name: "Index",
        component: Heating 
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;