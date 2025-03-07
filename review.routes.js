import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/review.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const reviewRoutes = (server) => {
  // Create review
  server.post("/api/review/:id", {
    preHandler: [authenticateUser],
    handler: createReview,
  });
  // Display all reviews
  server.get("/api/reviews", {
    preHandler: [authenticateUser],
    handler: getReviews,
  });
  // Display review
  server.get("/api/review/:id", {
    preHandler: [authenticateUser],
    handler: getReviewById,
  });
  // Updates reviews
  server.put("/api/review/:id", {
    preHandler: [authenticateUser],
    handler: updateReview,
  });
  //Delete reviews
  server.delete("/api/review/:id", {
    preHandler: [authenticateUser],
    handler: deleteReview,
  });
};
