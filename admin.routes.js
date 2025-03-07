import { getAdminDashboardStats } from "../controllers/admin.controllers.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";

export const adminRoutes = (server) => {
  server.get("/api/admin/dashboard", {
    preHandler: [authenticateUser, isAdmin],
    handler: getAdminDashboardStats,
  });
};