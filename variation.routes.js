import {
  createVariant,
  getVariants,
  getVariantById,
  updateVariant,
  deleteVariant,
} from "../controllers/variations.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const variantRoutes = (server) => {
  server.post("/api/variant/:id", {
    preHandler: [authenticateUser],
    handler: createVariant,
  });
  server.get("/api/variant", {
    preHandler: [authenticateUser],
    handler: getVariants,
  });
  server.get("/api/variant/:id", {
    preHandler: [authenticateUser],
    handler: getVariantById,
  });
  server.put("/api/variant/:id", {
    preHandler: [authenticateUser],
    handler: updateVariant,
  });
  server.delete("/api/variant/:id", {
    preHandler: [authenticateUser],
    handler: deleteVariant,
  });
};
