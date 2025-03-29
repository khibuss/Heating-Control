import { createRouter, createWebHistory } from "vue-router";
//IMPORTARE COMPONENT
import Heating from "./pages/heating.vue";
import Actuator from "./pages/actuators.vue";

const routes = [
    {
        path: "/",
        name: "Index",
        component: Heating
    },
    {
        path: "/acts",
        name: "Actuators",
        component: Actuator

    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;