import { createRouter, createWebHistory } from "vue-router";

import Layout from "@/shared/presentation/components/layout.vue";
import AuthLayout from "@/shared/presentation/components/auth.layout.vue";

const Login = () => import("@/userManagment/presentation/login.vue");
const Register = () => import("@/userManagment/presentation/register.vue");
const Profile = () => import('@/userManagment/presentation/profile.vue')
const Community = () => import("@/community/presentation/views/CommunityPage.vue");
const Reports = () => import("@/Reports/presentation/views/ReportView.vue");
const Home = () => import("@/shared/presentation/views/home.vue");
const NotFound = () => import("@/shared/presentation/views/page-not-found.vue");
const Healthy = () => import("@/healthy-life/presentation/views/healthy-life.vue");
const Appointment = () => import("@/appointments/presentation/views/appointment.vue");
const Notifications = () => import("@/notifications/presentation/views/notifications.vue");
const GlucometerDashboard = () => import("@/glucometer/presentation/views/glucometer-dashboard.vue");

const routes = [
    {
        path: "/auth",
        component: AuthLayout,
        children: [
            { path: "register", name: "register", component: Register, meta: { title: "Register" } },
            { path: "login", name: "login", component: Login, meta: { title: "Login" } },

        ],
    },

    {
        path: "/",
        component: Layout,
        children: [
            { path: "", name: "home", component: Home, meta: { title: "Home" } },
            { path: "gluco", name: "glucometer", component: GlucometerDashboard, meta: { title: "Glucometer" } },
            { path: "profile", name: "profile", component: Profile, meta: { title: "Profile" } },

            { path: "healthy", name: "healthy", component: Healthy, meta: { title: "Healthy Life" } },
            { path: "community", name: "community", component: Community, meta: { title: "Community" } },
            { path: "appointments", name: "appointments", component: Appointment, meta: { title: "Appointments" } },
            { path: "notifications", name: "notifications", component: Notifications, meta: { title: "Messages" } },
            { path: "reports", name: "reports", component: Reports, meta: { title: "Reports" } },
        ],
    },

    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: NotFound,
        meta: { title: "Page not found" },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const baseTitle = "Diabelife";
    document.title = `${baseTitle} - ${to.meta.title || ""}`;

    const isAuthenticated = localStorage.getItem("token");
    if (!isAuthenticated && !to.path.startsWith("/auth")) {
        return next("/auth/login");
    }

    next();
});

export default router;
