import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("../src/shared/views/home.vue");
const Reports = () => import("@/Reports/presentation/views/ReportView.vue");
const NotFound = () => import("../src/shared/views/page-not-found.vue");

const routes = [
    {
        path: "/",
        name: "home",
        component: Home,
        meta: { title: "Home" }
    },
    {
        path: "/reports",
        name: "reports",
        component: Reports,
        meta: { title: "Reports" }
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
