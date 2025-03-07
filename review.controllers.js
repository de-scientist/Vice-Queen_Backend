import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";
import { z, ZodError } from "zod";

const reviewSchema = z.object({
  // productId: z.string().uuid("Invalid product ID"),
  // userId: z.string().uuid("Invalid user ID"),
  starRating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

const prisma = new PrismaClient();

export const createReview = async (req, reply) => {
  try {
    // logger.info("Starting to create a new review");
    const data = reviewSchema.parse(req.body);
    const productId = req.params.id;
    const userId = req.user.id;

    if (!productId) {
      return reply.status(400).send({ error: "Product ID is required" });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        starRating: data.starRating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    logger.info(`Review created successfully with ID: ${review.id}`);
    reply.status(201).send(review);
  } catch (error) {
    logger.error(`Failed to create review: ${error.message}`);
    if (error instanceof ZodError) {
      reply.status(400).send({ message: "Failed to create a review." });
    }
    reply.status(500).send({ message: "Failed to create review" });
  }
};

export const getReviews = async (req, reply) => {
  try {
    logger.info("Fetching all reviews");
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        },
      },
    });

    logger.info(`Fetched ${reviews.length} reviews`);
    reply.status(200).send(reviews);
  } catch (error) {
    logger.error(`Failed to fetch reviews: ${error.message}`);
    reply.status(500).send({ message: "Failed to fetch reviews" });
  }
};

export const getReviewById = async (req, reply) => {
  try {
    const reviewId = req.params.id;
    logger.info(`Fetching review with ID: ${reviewId}`);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        },
      },
    });

    if (!review) {
      reply.status(404).send({ error: "Review not found" });
    } else {
      logger.info(`Fetched review with ID: ${review.id}`);
      reply.status(200).send(review);
    }
  } catch (error) {
    logger.error(`Failed to fetch review: ${error.message}`);
    reply.status(500).send({ message: "Failed to fetch review" });
  }
};

export const updateReview = async (req, reply) => {
  try {
    const reviewId = req.params.id;
    const data = reviewSchema.parse(req.body);
    logger.info(`Updating review with ID: ${reviewId}`);

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return reply.status(404).send({ message: "Review not found" });
    }

    if (existingReview.userId !== req.user.id) {
      return reply
        .status(403)
        .send({ message: "Not authorized to update this review" });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        starRating: data.starRating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        },
      },
    });

    logger.info(`Review updated successfully with ID: ${review.id}`);
    reply.status(200).send(review);
  } catch (error) {
    logger.error(`Failed to update review: ${error.message}`);

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation error",
      });
    }

    if (error.code === "P2025") {
      return reply.status(404).send({ message: "Review not found" });
    }

    reply
      .status(500)
      .send({ message: "An error occurred while updating the review" });
  }
};

export const deleteReview = async (req, reply) => {
  try {
    const reviewId = req.params.id;
    logger.info(`Deleting review with ID: ${reviewId}`);

    await prisma.review.delete({
      where: { id: reviewId },
    });

    logger.info(`Review deleted successfully with ID: ${reviewId}`);
    reply.status(200).send({ message: "The review is deleted successfully" });
  } catch (error) {
    logger.error(`Failed to delete review: ${error.message}`);
    reply.status(500).send({ message: "Failed to delete review" });
  }
};
