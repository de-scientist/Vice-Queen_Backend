import {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    updateDelivery,
    updateDeliveryStatus,
  } from "../controllers/delivery.controllers.js";
  import { authenticateUser, isAdmin} from "../middlewares/auth.js";
  
  export const deliveryRoutes = (server) => {
    //Creates a new delivery info
    server.post("/api/delivery/:id", { preHandler: [authenticateUser], handler: createDelivery });

    //Displays the deliveries
    server.get("/api/delivery", { preHandler: [authenticateUser, isAdmin], handler: getDeliveries });

    //Display a delivery
    server.get("/api/delivery/:id", { preHandler: [authenticateUser, isAdmin], handler: getDeliveryById });

    //Updated delivery by user
    server.put("/api/delivery/:id", {preHandler: [authenticateUser], handler: updateDelivery})
    
    //Updates Delivery Status
    server.put("/api/delivery/:id/status", { preHandler: [authenticateUser, isAdmin], handler: updateDeliveryStatus });
  };