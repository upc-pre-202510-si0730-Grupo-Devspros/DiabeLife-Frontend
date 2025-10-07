import { createRouter, createWebHistory } from "vue-router";



const Reports = () => import("@/Reports/presentation/views/ReportView.vue");
const Home = () => import("./shared/presentation/views/home.vue");
const NotFound = () => import("./shared/presentation/views/page-not-found.vue");
const Healthy = () => import("./healthy-life/presentation/views/healthy-life.vue");
const Appointment = () => import("./appointments/presentation/views/appointment.vue");
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
        path: "/healthy",
        name: "healthy",
        component: Healthy,
        meta: { title: "Healthy Life" }
    },
    {
        path: "/appointments",
        name: "appointments",
        component: Appointment,
        meta: { title: "Appointments" } 
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
    const baseTitle = "Diabelife";
    document.title = `${baseTitle} - ${to.meta.title || ""}`;
    next();
});

export default router;