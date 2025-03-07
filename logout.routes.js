// import pkg from '../../controllers/logout.controllers.js'
import { logout } from "../../controllers/logout.controllers.js";
import { checkTokenBlacklist } from "../../middlewares/logout.middlewares.js";

// const { logoutController } = pkg;
export const logoutRoutes = (server) => {
  server.post("/api/auth/logout", {
    preHandler: [checkTokenBlacklist],
    handler: logout,
  });
};
