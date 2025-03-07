import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";
import { z } from "zod";

const prisma = new PrismaClient();

const deliverySchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const createDelivery = async (req, reply) => {
  try {
    const data = deliverySchema.parse(req.body);
    const userId = req.user.id;
    const orderId = req.params.id;
    logger.info("Creating a new delivery");

    const delivery = await prisma.delivery.create({
      data: {
        userId,
        orderId,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        status: "pending",
      },
    });

    logger.info(`Delivery created successfully with ID: ${delivery.id}`);
    reply.status(201).send(delivery);
  } catch (error) {
    console.error(error)
    logger.error(`Failed to create delivery: ${error.message}`);
    reply.status(500).send({ error: "Failed to create delivery" });
  }
};

export const getDeliveries = async (req, reply) => {
  try {
    logger.info("Fetching all deliveries");
    const deliveries = await prisma.delivery.findMany();

    logger.info(`Fetched ${deliveries.length} deliveries`);
    reply.status(200).send(deliveries);
  } catch (error) {
    logger.error(`Failed to fetch deliveries: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch deliveries" });
  }
};

export const getDeliveryById = async (req, reply) => {
  try {
    const deliveryId = req.params.id;
    logger.info(`Fetching delivery with ID: ${deliveryId}`);

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      reply.status(404).send({ error: "Delivery not found" });
    } else {
      logger.info(`Fetched delivery with ID: ${delivery.id}`);
      reply.status(200).send(delivery);
    }
  } catch (error) {
    logger.error(`Failed to fetch delivery: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch delivery" });
  }
};

//User can update the delivery information
export const updateDelivery = async (req, reply) => {
    try {
      const deliveryId = req.params.id;
      const userId = req.user.id;
      const data = deliverySchema.parse(req.body);
      logger.info(`Updating delivery status with ID: ${deliveryId}`);
  
      const delivery = await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
            userId,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
        }
      });
  
      logger.info(`Delivery status updated successfully with ID: ${delivery.id}`);
      reply.status(200).send(delivery);
    } catch (error) {
        console.error(error);
      logger.error(`Failed to update delivery status: ${error.message}`);
      reply.status(500).send({ error: "Failed to update delivery status" });
    }
  };

  //Admin gets to update the delivery status
export const updateDeliveryStatus = async (req, reply) => {
  try {
    const deliveryId = req.params.id;
    const { status } = req.body;
    logger.info(`Updating delivery status with ID: ${deliveryId}`);

    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: { status },
    });

    logger.info(`Delivery status updated successfully with ID: ${delivery.id}`);
    reply.status(200).send(delivery);
  } catch (error) {
    console.error(error)
    logger.error(`Failed to update delivery status: ${error.message}`);
    reply.status(500).send({ error: "Failed to update delivery status" });
  }
};