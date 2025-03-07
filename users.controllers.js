import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { logger } from "../middlewares/logging.middlewares.js";

const registerSchema = z.object({
  firstname: z.string().min(3, "Please enter valid name."),
  lastname: z.string().min(3, "Plaese enter valid name."),
  email: z.string().email("Please enter a valid Email address."),
  password: z.string(),
});

const updateSchema = z.object({
  firstname: z.string().min(3, "Please enter valid name."),
  lastname: z.string().min(3, "Plaese enter valid name."),
  password: z.string().optional(),
  phoneNo: z.string().optional(),
  avatar: z.string().optional(),
  role: z.string().optional()
});
const prisma = new PrismaClient();

export const createUser = async (req, reply) => {
  try {
    const data = registerSchema.parse(req.body);
    logger.info("Admin creating a new user");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: hashedPassword,
        phoneNo: data.phoneNo,
      },
    });

    logger.info(`User created successfully with ID: ${user.id}`);
    reply.status(201).send(user);
  } catch (error) {
    logger.error(`Failed to create user: ${error.message}`);
    reply.status(500).send({ error: "Failed to create user" });
  }
};

export const getAllUser = async (req, reply) => {
  try {
    logger.info(`Fetch all users`);
    const users = await prisma.user.findMany();
    reply.status(200).send(users);
  } catch (error) {
    logger.error(`Failed to get all users: ${error.message}`);
    reply.status(500).send({ message: "Failed to get all users" });
  }
};

export const getUser = async (req, reply) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching user with ID: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      reply.status(404).send({ error: "User not found" });
    } else {
      logger.info(`Fetched user with ID: ${user.id}`);
      reply.status(200).send(user);
    }
  } catch (error) {
    logger.error(`Failed to fetch user: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch user" });
  }
};

export const updateUser = async (req, reply) => {
  try {
    const userId = req.user.id;
    const data = updateSchema.parse(req.body);
    logger.info(`Updating user with ID: ${userId}`);

    const updateData = {
      firstname: data.firstname,
      lastname: data.lastname,
      phoneNo: data.phoneNo,
      avatar: data.avatar,
      role: data.role
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { userId: userId },
      data: updateData,
    });

    logger.info(`User updated successfully with ID: ${user.id}`);
    reply.status(200).send(user);
  } catch (error) {
    logger.error(`Failed to update user: ${error.message}`);
    reply.status(500).send({ message: "Failed to update user", error: error });
  }
};

export const deleteUser = async (req, reply) => {
  try {
    const userId = req.user.id;
    logger.info(`Deleting user with ID: ${userId}`);

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`User deleted successfully with ID: ${userId}`);
    reply.status(204).send();
  } catch (error) {
    logger.error(`Failed to delete user: ${error.message}`);
    reply.status(500).send({ error: "Failed to delete user" });
  }
};
