import {
  createPayment,
  getPayments,
  getPaymentById,
  mpesaCallback, 
} from "../controllers/payment.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const paymentRoutes = (server) => {
  server.post("/api/payments", {
    preHandler: [authenticateUser],
    handler: createPayment,
  });
  server.get("/api/payments", {
    preHandler: [authenticateUser],
    handler: getPayments,
  });

  //User's Dasboard
  server.get("/api/payments/:id", {
    preHandler: [authenticateUser],
    handler: getPaymentById,
  });
  server.post("/api/payments/mpesa-callback", mpesaCallback);
};
