import { registerUser } from "../../controllers/register.controllers.js";

export const registerRoutes = (server) => {
  server.post("/api/register", async (request, reply) => {
    try {
      const response = await registerUser(request, reply);
      reply.send(response);
    } catch (error) {
      reply.status(400).send({ message: error.message || "Registration failed" });
    }
  });
};
