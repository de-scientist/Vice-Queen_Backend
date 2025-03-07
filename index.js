import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import { registerRoutes } from "./src/routes/authRoutes/register.routes.js";
import { loggingMiddleware } from "./src/middlewares/logging.middlewares.js";
import { loginRoutes } from "./src/routes/authRoutes/login.routes.js";
import { logoutRoutes } from "./src/routes/authRoutes/logout.routes.js";
import { productRoutes } from "./src/routes/products.routes.js";
import { categoryRoutes } from "./src/routes/category.routes.js";
import { orderRoutes } from "./src/routes/order.routes.js";
import { reviewRoutes } from "./src/routes/review.routes.js";
import { cartRoutes } from "./src/routes/cart.routes.js";
import { variantRoutes } from "./src/routes/variation.routes.js";
import { paymentRoutes } from "./src/routes/payment.routes.js";
import { userRoutes } from "./src/routes/users.routes.js";
import { deliveryRoutes } from "./src/routes/delivery.routes.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const HOST = process.env.RENDER ? "0.0.0.0" : "localhost";

const server = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

// Ensure JWT secret is set
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ Warning: JWT_SECRET is not set! Using a default secret.");
}

// Register CORS
server.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = ["http://localhost:5173"];
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: true, // Add this line
});

// Register JWT
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "default_secret",
  sign: { algorithm: "HS256" },
  verify: { algorithms: ["HS256"] },
});

// Register Cookie
server.register(fastifyCookie);

// Register middleware
server.addHook("preHandler", loggingMiddleware);

// Remove the manual CORS headers setting middleware
// The fastifyCors plugin already handles this
// server.addHook("preHandler", (req, reply, done) => {
//   reply.header("Access-Control-Allow-Origin", "*");
//   reply.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
//   reply.header("Access-Control-Allow-Headers", "*");

//   if (req.method === "OPTIONS") {
//     reply.code(204).send();
//     return;
//   }

//   done();
// });

// Register rate limiting with improved error message
server.register(fastifyRateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: "Too Many Requests",
    message: "Too many requests, please try again later.",
  }),
});

// Register routes
registerRoutes(server);
loginRoutes(server);
logoutRoutes(server);
userRoutes(server);
productRoutes(server);
categoryRoutes(server);
orderRoutes(server);
reviewRoutes(server);
cartRoutes(server);
variantRoutes(server);
paymentRoutes(server);
deliveryRoutes(server);

// Start the server
const start = async () => {
  try {
    await server.listen({ host: HOST, port: PORT });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

start();
