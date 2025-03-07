import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // Ensure correct import for JWT
import { logger } from "../middlewares/logging.middlewares.js";

dotenv.config();

// Validation Schema
const loginSchema = z.object({
  email: z.string().email({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }),
  password: z.string(),
});

// Initialize Prisma
const prisma = new PrismaClient();

export const loginController = async (req, reply) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user by email
    const login = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!login) {
      logger.info(`Invalid login attempt for email: ${data.email}`);
      return reply.status(400).send({ message: "Invalid email address" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(data.password, login.password);
    if (!isPasswordValid) {
      logger.info(`Invalid password attempt for email: ${data.email}`);
      return reply.status(400).send({ error: "Invalid password" });
    }

    // Generate JWT payload
    const payload = {
      id: login.userId,
      firstname: login.firstname,
      lastname: login.lastname,
      email: login.email,
      phoneNo: login.phoneNo,
      role: login.role,
      avatar: login.avatar,
    };

    // Sign JWT token
    const secretKey = process.env.JWT_SECRET || "hurry";
    const token = jwt.sign(payload, secretKey, { expiresIn: "3600h" });

    // Set token in HTTP-only cookie
    reply.setCookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set token in response header
    reply.header("Authorization", `Bearer ${token}`);

    // Send response
    reply.status(200).send({
      message: "User logged in successfully",
      token,
      user: {
        id: login.userId,
        firstname: login.firstname,
        lastname: login.lastname,
        email: login.email,
        role: login.role,
      },
    });
  } catch (error) {
    logger.error("Error:", error);
    console.error("Error:", error);

    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: error.errors });
    }

    reply.status(500).send({ message: "An error occurred. Please try again." });
  }
};
