import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUser,
} from "../controllers/users.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const userRoutes = (server) => {
  server.post("/api/user", {
    preHandler: [authenticateUser],
    handler: createUser,
  });
  server.get("/api/users", {
    preHandler: [authenticateUser],
    handler: getAllUser,
  });
  server.get("/api/users/:id", {
    preHandler: [authenticateUser],
    handler: getUser,
  });
  server.put("/api/user/:id", {
    preHandler: [authenticateUser],
    handler: updateUser,
  });
  server.delete("/api/user/:id", {
    preHandler: [authenticateUser],
    handler: deleteUser,
  });
};
