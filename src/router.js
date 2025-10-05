import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("../src/shared/views/home.vue");
const NotFound = () => import("../src/shared/views/page-not-found.vue");
const Healthy = () => import("../src/shared/views/healthy-life.vue");

const routes = [
    {
        path: "/",
        name: "home",
        component: Home,
        meta: { title: "Home" }
    },
    {
        path: "/healthy",
        name: "healthy",
        component: Healthy,
        meta: { title: "Healthy Life" }
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: NotFound,
        meta: { title: "Page not found" }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeEach((to, from, next) => {
    const baseTitle = "My App";
    document.title = `${baseTitle} - ${to.meta.title || ""}`;
    next();
});

export default router;
