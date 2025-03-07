import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";

const categorySchema = z.object({
  name: z.string().min(3, "Category name is required"),
  description: z.string().optional(),
});

const prisma = new PrismaClient();

export const createCategory = async (req, reply) => {
  try {
    const data = categorySchema.parse(req.body);
    logger.info(`Creating a new category`);
    //Match unique strings
    const matchCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (matchCategory) {
      reply.status(400).send({ message: "This category already exists." });
      return;
    }

    //Create a new category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    logger.info(`Successfuly created the category: ${category.id}`);
    reply.status(201).send(category);
  } catch (error) {
    logger.info(`Failed to create category: ${("Error: ", error)}`);
    console.error("Error:", error);
    reply.status(500).send({ error: "Failed to create category" });
  }
};

export const getCategories = async (req, reply) => {
  try {
    logger.info(`Fetching all categories`);
    const categories = await prisma.category.findMany();
    logger.info(`Categories found: ${categories}`);
    reply.status(200).send(categories);
  } catch (error) {
    logger.info(`Failed to fetch categories: ${("Error :", error)}`);
    reply.status(500).send({ error: "Failed to fetch categories" });
  }
};

 //This selects a category and displays the products
export const getCategoryById = async (req, reply) => {
  try {
    const categoryId = req.params.id;
    logger.info(`Fetching the category with categoryId: ${categoryId}`);
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            currentPrice: true,
            previousPrice: true,
            stock: true,
            images: true
          }
        }
      }
    });
    if (!category) {
      logger.info(`Failed to fetch ${category.id} for it was not found`);
      reply.status(404).send({ message: "Category not found" });
    } else {
      logger.info(`Successfully found the category ${category.id}`);
      reply.status(200).send(category);
    }
  } catch (error) {
    logger.info(`Failed to fetch the catgory: ${("Error :", error)}`);
    console.error("Error: ", error);
    reply.status(500).send({ message: "Failed to fetch category" });
  }
};

//This updates the name and description of the category
export const updateCategory = async (req, reply) => {
  try {
    const data = categorySchema.parse(req.body);
    const categoryId = req.params.id;
    logger.info(`Updating category ${categoryId}`);
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: data,
    });
    logger.info(`Successfully updated category: ${category.id}`);
    reply
      .status(200)
      .send({ message: "Category updated sucessfully.", category });
  } catch (error) {
    logger.info(`Failed to update category. ${("Error :", error)}`);
    reply.status(500).send({ message: "Failed to update category" });
  }
};

//This deletes the category
export const deleteCategory = async (req, reply) => {
  try {
    const categoryId = req.params.id;
    logger.info(`Starts to delete: ${categoryId}`);

    // First check if there are any products in this category
    const productsCount = await prisma.product.count({
      where: { categoryId: categoryId },
    });

    // If products exist and no confirmation provided, ask for confirmation
    if (productsCount > 0 && !req.query.confirmed) {
      logger.info(
        `Category ${categoryId} has ${productsCount} products. Confirmation required`,
      );
      return reply.status(409).send({
        message: `This category contains ${productsCount} products. Please confirm deletion by adding ?confirmed=true to your request.`,
        requiresConfirmation: true,
        productCount: productsCount,
      });
    }

    // If confirmed or no products, proceed with deletion
    const productDelete = await prisma.product.deleteMany({
      where: { categoryId: categoryId },
    });
    if (productDelete) {
      logger.info(
        `Deleted ${productDelete.count} products related to category ID: ${categoryId}`,
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    logger.info(`Successfully deletes: ${categoryId}`);
    reply.status(200).send({ message: "Category successfully deleted." });
  } catch (error) {
    logger.error(`Failed to delete category: ${error}`);
    reply.status(500).send({ error: error.message });
  }
};
