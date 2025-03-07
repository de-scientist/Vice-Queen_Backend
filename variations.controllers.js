import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";
import { z } from "zod";

const variantSchema = z.object({
  variantName: z.string().min(1, "Variant name is required"),
  variations: z.array(z.string().min(1, "Variation cannot be empty")),
});

const prisma = new PrismaClient();

export const createVariant = async (req, reply) => {
  try {
    logger.info("Starting to create a new variant");
    const data = variantSchema.parse(req.body);
    const productId = req.params.id;

    const variant = await prisma.variant.create({
      data: {
        productId,
        variantName: data.variantName,
        variations: data.variations,
      },
      include: {
        product: true,
      },
    });

    logger.info(`Variant created successfully with ID: ${variant.id}`);
    reply.status(201).send(variant);
  } catch (error) {
    logger.error(`Failed to create variant: ${error.message}`);
    reply.status(500).send({ error: "Failed to create variant" });
  }
};

export const getVariants = async (req, reply) => {
  try {
    logger.info("Fetching all variants");
    const variants = await prisma.variant.findMany();

    logger.info(`Fetched ${variants.length} variants`);
    reply.status(200).send(variants);
  } catch (error) {
    logger.error(`Failed to fetch variants: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch variants" });
  }
};

export const getVariantById = async (req, reply) => {
  try {
    const variantId = req.params.id;
    logger.info(`Fetching variant with ID: ${variantId}`);

    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      reply.status(404).send({ error: "Variant not found" });
    } else {
      logger.info(`Fetched variant with ID: ${variant.id}`);
      reply.status(200).send(variant);
    }
  } catch (error) {
    logger.error(`Failed to fetch variant: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch variant" });
  }
};

export const updateVariant = async (req, reply) => {
  try {
    const variantId = req.params.id;
    const data = variantSchema.parse(req.body);
    logger.info(`Updating variant with ID: ${variantId}`);

    const existingVariant = await prisma.variant.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      logger.error(`Variant with ID ${variantId} not found`);
      return reply.status(404).send({ error: "Variant not found" });
    }

    const variant = await prisma.variant.update({
      where: { id: variantId },
      data: {
        variantName: data.variantName,
        variations: data.variations,
      },
    });

    logger.info(`Variant updated successfully with ID: ${variant.id}`);
    reply.status(200).send(variant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error(`Validation error: ${error.message}`);
      return reply
        .status(400)
        .send({ error: "Invalid input data", details: error.errors });
    }
    logger.error(`Failed to update variant: ${error.message}`);
    reply.status(500).send({ error: "Failed to update variant" });
  }
};

export const deleteVariant = async (req, reply) => {
  try {
    const variantId = req.params.id;
    logger.info(`Deleting variant with ID: ${variantId}`);

    const verifyVariation = await prisma.variant.findUnique({
      where: { id: variantId },
    });

    if (!verifyVariation) {
      logger.info(`Did not find the variant ${variantId}`);
      return reply.status(404).send({ message: "Variant not found" });
    }

    await prisma.variant.delete({
      where: { id: variantId },
    });

    logger.info(`Variant deleted successfully with ID: ${variantId}`);
    reply.status(200).send({ message: "Variant deleted successfully." });
  } catch (error) {
    logger.error(`Failed to delete variant: ${error.message}`);
    reply
      .status(500)
      .send({ message: "Failed to delete variant", error: error });
  }
};
