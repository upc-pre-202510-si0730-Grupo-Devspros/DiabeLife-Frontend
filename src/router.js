import { createRouter, createWebHistory } from "vue-router";

// Importa los componentes de las vistas
const Home = () => import("@/shared/presentation/views/home.vue");
const NotFound = () => import("@/shared/presentation/views/page-not-found.vue");
const GlucometerDashboard = () => import("@/glucometer/presentation/views/glucometer-dashboard.vue");

const routes = [
    {
        path: "/",
        name: "home",
        component: Home,
        meta: { title: "Home" }
    },
    {
        path: "/gluco",
        name: "glucometer",
        component: GlucometerDashboard,
        meta: { title: "Glucometer" }
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
    const baseTitle = "Diabelife";
    document.title = `${baseTitle} - ${to.meta.title || ""}`;
    next();
});

export default router;