import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByStatus,
  deleteOrders,
} from "../controllers/orders.controllers.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";

export const orderRoutes = (server) => {
  //Creates a new order
  server.post("/api/orders", {
    preHandler: [authenticateUser],
    handler: createOrder,
  });
  //Reads orders
  server.get("/api/orders", {
    preHandler: [authenticateUser],
    handler: getOrders,
  });
  //Sort status
  server.get("/api/order/status/:status", {
    preHandler: [authenticateUser, isAdmin],
    handler: getOrdersByStatus,
  });
  //Reads a order
  server.get("/api/orders/:id", {
    preHandler: [authenticateUser],
    handler: getOrderById,
  });
  //Updates a order
  server.put("/api/orders/:id", {
    preHandler: [authenticateUser],
    handler: updateOrder,
  });

  //Deletes a order
  server.delete("/api/orders/:id", {
    preHandler: [authenticateUser],
    handler: deleteOrder,
  });
  
  //Deletes multiple orders
  server.delete("/api/orders/many", {
    preHandler: [authenticateUser],
    handler: deleteOrders,
  });
};
