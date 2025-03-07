import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createMany,
  filterProducts,
  searchProducts,
} from "./../controllers/product.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const productRoutes = (server) => {
  // server.post("/api/products", {
  //   preHandler: [authenticateUser],
  //   handler: createProduct,
  // });

  //Creats a product
  server.post("/api/categories/:categoryId/product", {
    preHandler: [authenticateUser],
    handler: createProduct,
  });

  //Creates multiple products
  server.post("/api/categories/:categoryId/products", {
    preHandler: [authenticateUser],
    handler: createMany,
  });

  //Displays products
  server.get("/api/products", { handler: getProducts });
  server.get("/api/products/:id", { handler: getProductById });

  //Updates product
  server.put("/api/products/:id", {
    preHandler: [authenticateUser],
    handler: updateProduct,
  });

  //Filter products
  server.get("/api/products/filter", { handler: filterProducts });

  //Search products
  server.get("/api/products/search", { handler: searchProducts });

  //Deletes products
  server.delete("/api/products/:id", {
    preHandler: [authenticateUser],
    handler: deleteProduct,
  });
};
