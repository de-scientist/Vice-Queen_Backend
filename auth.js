import pkg from "fastify";
const { FastifyReply, FastifyRequest } = pkg;
import winston from "winston";

// Configure Winston logger for handling application logs
const logger = winston.createLogger({
  level: "info", // Set default log level
  format: winston.format.json(),
  transports: [
    // Store error logs in error.log file
    new winston.transports.File({ filename: "error.log", level: "error" }),
    // Store all logs in combined.log file
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Add console logging in non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user information to request
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export const authenticateUser = async (request, reply) => {
  try {
    // Extract token from cookies or authorization header
    const token =
      request.cookies.token || 
      request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      logger.info("Unauthorized access attempt: No token provided");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "No token provided"
      });
    }

    // Verify JWT token and decode user information
    const decoded = await request.jwtVerify();
    
    // Attach user information to request
    request.user = decoded;

    logger.info(
      `User ${decoded.id} with ${decoded.firstname} and ${decoded.role} authenticated successfully`
    );
  } catch (err) {
    logger.info(`Authentication failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: err.message
    });
  }
};

/**
 * Admin role verification middleware
 * Ensures the authenticated user has admin privileges
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export const isAdmin = async (request, reply) => {
  try {
    // Check if user exists and has admin role
    if (!request.user || request.user.role !== "admin") {
      logger.info(`Unauthorized admin access attempt from user: ${request.user?.id || 'unknown'}`);
      return reply.code(403).send({
        error: "Access denied. Admins Only",
        message: "Admin privileges required.",
      });
    }
    return;
  } catch (err) {
    logger.info(`Authentication failed in admin check: ${err.message}`);
    console.error(err);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};

/**
 * Regular user role verification middleware
 * Ensures the authenticated user has user role
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export const isUser = async (request, reply) => {
  try {
    request.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Check if user exists and has user role
    if (!user || user.role !== "user") {
      logger.info(`Unauthorized access attempt`); // Fixed: removed undefined 'decoded' reference
      return reply.code(403).send({
        error: "Access denied",
        message: "User privileges required",
      });
    }
    return;
  } catch (err) {
    logger.info(`Authentication failed: ${err.message}`); // Fixed: removed undefined 'decoded' reference
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};
