import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controllers.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";

export const categoryRoutes = (server) => {
  //Creates a new category (Admin)
  server.post("/api/categories", {
    preHandler: [authenticateUser],
    handler: createCategory,
  });
  //Lists a list of category
  server.get("/api/categories", { handler: getCategories });

  //Lists a selected category. Displays the products associated to it.
  server.get("/api/categories/:id", { handler: getCategoryById });

  //Updates a category
  server.put("/api/categories/:id", {
    preHandler: [authenticateUser],
    handler: updateCategory,
  });

  //Deletes a category
  server.delete("/api/categories/:id", {
    preHandler: [authenticateUser],
    handler: deleteCategory,
  });
};
