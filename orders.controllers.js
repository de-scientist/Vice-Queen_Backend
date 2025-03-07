import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";

const prisma = new PrismaClient();

const orderSchema = z.object({
  totalAmount: z.number().positive("Total amount must be a positive number"),
  status: z.enum(["pending", "shipped", "delivered"]).default("pending"),
  orderItems: z.array(
    z.object({
      productId: z.string().uuid("Invalid product ID"),
      quantity: z
        .number()
        .int()
        .positive("Quantity must be a positive integer"),
    }),
  ),
});

const deleteOrdersSchema = z.object({
  orderIds: z.array(z.string().uuid("Invalid order ID")),
});

export const createOrder = async (req, reply) => {
  try {
    const data = orderSchema.parse(req.body);
    logger.info(`Starting to create the order.`);
    const userId = req.user.id;

    // First, verify all products exist and get their IDs
    const productsToOrder = await Promise.all(
      data.orderItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, currentPrice: true },
        });

        if (!product) {
          logger.info(`Failed to find the product`);
          reply.status(400).send(`Product with ID ${item.productId} not found`);
        }

        return {
          productId: product.id,
          quantity: item.quantity,
        };
      }),
    );

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: data.totalAmount,
        status: data.status,
        orderItems: {
          create: productsToOrder,
        },
      },
      include: {
        orderItems: true,
      },
    });
    logger.info(`Succefully created the order: ${order.id}`);
    reply.status(201).send(order);
  } catch (error) {
    logger.info(`Failed to create the order: ${("Error :", error)}`);
    console.error("Error:", error);
    if (error instanceof z.ZodError) {
      logger.info(`Failed to create the order: ${("Error :", error)}`);
      reply.status(400).send({ message: "Failed to create the order" });
    }
    reply.status(500).send({ message: "Failed to create the order." });
  }
};

export const getOrders = async (req, reply) => {
  try {
    // logger.info("Fetching all orders");
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
    });

    // logger.info(`Fetched ${orders.length} orders`);
    reply.status(200).send(orders);
  } catch (error) {
    // logger.error(`Failed to fetch orders: ${error.message}`);
    reply.status(500).send({ error: error });
  }
};

export const getOrdersByStatus = async (req, reply) => {
  try {
    const { status } = req.params;
    logger.info(`Fetching orders with status: ${status}`);

    const orders = await prisma.order.findMany({
      where: { status },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc", // Sort by creation date in descending order
      },
    });

    if (orders.length === 0) {
      reply
        .status(404)
        .send({ message: `No orders found with status: ${status}` });
    } else {
      logger.info(`Fetched ${orders.length} orders with status: ${status}`);
      reply.status(200).send(orders);
    }
  } catch (error) {
    logger.error(`Failed to fetch orders by status: ${error.message}`);
    reply
      .status(500)
      .send({ message: "Failed to display the status records." });
  }
};

export const getOrderById = async (req, reply) => {
  try {
    const orderId = req.params.id;
    logger.info(`Fetching order with ID: ${orderId}`);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      reply.status(404).send({ error: "Order not found" });
    } else {
      logger.info(`Fetched order with ID: ${order.id}`);
      reply.status(200).send(order);
    }
  } catch (error) {
    logger.error(`Failed to fetch order: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch order" });
  }
};

export const updateOrder = async (req, reply) => {
  try {
    const orderId = req.params.id;
    logger.info(`Updating order with ID: ${orderId}`);
    const data = orderSchema.parse(req.body);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount: data.totalAmount,
        status: data.status,
        orderItems: {
          deleteMany: {},
          create: data.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    logger.info(`Order updated successfully with ID: ${order.id}`);
    reply.status(200).send(order);
  } catch (error) {
    logger.error(`Failed to update order: ${error.message}`);
    if (error instanceof z.ZodError) {
      logger.info(`Failed to create the order: ${("Error :", error)}`);
      reply.status(400).send({ message: "Failed to update the order" });
    }
    reply.status(500).send({ error: "Failed to update order" });
  }
};

export const deleteOrder = async (req, reply) => {
  try {
    const orderId = req.params.id;
    logger.info(`Deleting order with ID: ${orderId}`);

    const confRecord = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!confRecord) {
      logger.info(`The ${("Order:", orderId)} does not exist.`);
      reply.status(200).send({ message: "The order does not exist." });
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    await prisma.order.delete({
      where: { id: orderId },
    });

    logger.info(`Order deleted successfully with ID: ${orderId}`);
    reply.status(200).send({ message: "Order successfully deleted." });
  } catch (error) {
    console.error("Error :", error);
    logger.error(`Failed to delete order: ${error.message}`);
    reply
      .status(500)
      .send({ message: "Failed to delete order.", error: error });
  }
};

export const deleteOrders = async (req, reply) => {
  try {
    logger.info("Starting to delete multiple orders");
    const { orderIds } = deleteOrdersSchema.parse(req.body);

    const confRecord = await prisma.order.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });
    if (confRecord.length === 0) {
      logger.info(`No orders found with the provided IDs`);
      return reply.status(404).send({ message: "The orders do not exist." });
    }

    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });

    const deleteResult = await prisma.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    if (deleteResult.count === 0) {
      logger.info(`Failed to delete for no orders were found to delete.`);
      reply.status(404).send({ message: "No orders found to delete" });
    } else {
      logger.info(`Deleted ${deleteResult.count} orders successfully`);
      reply
        .status(200)
        .send({ message: `Deleted ${deleteResult.count} orders successfully` });
    }
  } catch (error) {
    logger.error(`Failed to delete orders: ${error.message}`);
    if (error instanceof z.ZodError) {
      reply.status(400).send({ message: error.errors });
    } else {
      reply
        .status(500)
        .send({ message: "Failed to delete orders", error: error });
    }
  }
};
