import { loginController } from "../../controllers/login.controllers.js";

export const loginRoutes = (server) => {
  server.post("/api/auth/login", loginController);
};
