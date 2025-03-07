import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";

const prisma = new PrismaClient();

export const getAdminDashboardStats = async (req, reply) => {
  try {
    logger.info("Fetching admin dashboard statistics");

    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalSales = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const stats = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalSales: totalSales._sum.totalAmount || 0,
    };

    logger.info("Fetched admin dashboard statistics successfully");
    reply.status(200).send(stats);
  } catch (error) {
    logger.error(`Failed to fetch admin dashboard statistics: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch admin dashboard statistics" });
  }
};