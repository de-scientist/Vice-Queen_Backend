import {
  createCart,
  getCart,
  updateCart,
  deleteCart,
  addProductToCart,
  deleteProductFromCart,
  incrementQuantityToCart,
  decrementQuantityFromCart,
} from "../controllers/cart.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const cartRoutes = (server) => {
  server.post("/api/cart", {
    preHandler: [authenticateUser],
    handler: createCart,
  });
  server.get("/api/cart", { preHandler: [authenticateUser], handler: getCart });
  server.put("/api/cart", {
    preHandler: [authenticateUser],
    handler: updateCart,
  });
  server.delete("/api/cart", {
    preHandler: [authenticateUser],
    handler: deleteCart,
  });
  server.post("/api/cart/add", {
    preHandler: [authenticateUser],
    handler: addProductToCart,
  });
  server.post("/api/cart/delete", {
    preHandler: [authenticateUser],
    handler: deleteProductFromCart,
  });
  server.put("/api/cart/quantity/increment/:id", {
    preHandler: [authenticateUser],
    handler: incrementQuantityToCart,
  });
  server.put("/api/cart/quantity/decrement/:id", {
    preHandler: [authenticateUser],
    handler: decrementQuantityFromCart,
  });
};
