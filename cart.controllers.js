import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";
import { z } from "zod";

const cartSchema = z.object({
  cartItems: z.array(
    z.object({
      productId: z.string().uuid("Invalid product ID"),
      quantity: z
        .number()
        .int()
        .positive("Quantity must be a positive integer"),
    }),
  ),
});

const quantitySchema = z.object({
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});
const prisma = new PrismaClient();

export const createCart = async (req, reply) => {
  try {
    logger.info("Starting to create a new cart");
    const userId = req.user.id;
    const data = cartSchema.parse(req.body);

    // Check if user already has a cart
    const existingCart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (existingCart) {
      logger.warn(`Cart already exists for user ${userId}`);
      return reply.status(409).send({
        message: "User already has a cart",
      });
    }

    const cart = await prisma.cart.create({
      data: {
        userId,
        cartItems: {
          create: data.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        cartItems: true,
      },
    });

    logger.info(`Cart created successfully with ID: ${cart.id}`);
    reply.status(201).send(cart);
  } catch (error) {
    if (error.code === "P2002") {
      logger.error(`Unique constraint violation: ${error.message}`);
      reply.status(409).send({ message: "Cart already exists" });
    } else if (error.code === "P2003") {
      logger.error(`Foreign key constraint violation: ${error.message}`);
      reply.status(400).send({ message: "Invalid product reference" });
    } else {
      logger.error(`Failed to create cart: ${error.message}`);
      reply.status(500).send({ message: "Failed to create cart" });
    }
  }
};

export const getCart = async (req, reply) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching cart for user ID: ${userId}`);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      reply.status(404).send({ error: "Cart not found" });
    } else {
      logger.info(`Fetched cart with ID: ${cart.id}`);
      reply.status(200).send(cart);
    }
  } catch (error) {
    logger.error(`Failed to fetch cart: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch cart" });
  }
};

export const updateCart = async (req, reply) => {
  try {
    const userId = req.user.id;
    logger.info(`Updating cart for user ID: ${userId}`);
    const data = cartSchema.parse(req.body);

    const cart = await prisma.cart.update({
      where: { userId },
      data: {
        cartItems: {
          deleteMany: {},
          create: data.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        cartItems: true,
      },
    });

    logger.info(`Cart updated successfully with ID: ${cart.id}`);
    reply.status(200).send(cart);
  } catch (error) {
    if (error.code === "P2025") {
      logger.warn(`Cart not found for user ${userId}`);
      reply.status(404).send({ message: "Cart not found" });
    } else if (error.code === "P2003") {
      logger.error(`Foreign key constraint violation: ${error.message}`);
      reply.status(400).send({ message: "Invalid product reference" });
    } else {
      logger.error(`Failed to update cart: ${error.message}`);
      reply.status(500).send({ error: "Failed to update cart" });
    }
  }
};

export const deleteCart = async (req, reply) => {
  try {
    const userId = req.user.id;
    logger.info(`Deleting cart for user ID: ${userId}`);

    await prisma.cartItem.deleteMany({
      where: { cartId: userId },
    });

    await prisma.cart.delete({
      where: { userId },
    });

    logger.info(`Cart deleted successfully for user ID: ${userId}`);
    reply.status(200).send({ message: "Cart deleted successfully." });
  } catch (error) {
    logger.error(`Failed to delete cart: ${error.message}`);
    reply.status(500).send({ error: "Failed to delete cart" });
  }
};

export const addProductToCart = async (req, reply) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    logger.info(`Adding product ${productId} to cart for user ID: ${userId}`);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      reply.status(404).send({ error: "Cart not found" });
      return;
    }

    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId,
    );

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    logger.info(`Product ${productId} added to cart for user ID: ${userId}`);
    reply.status(200).send(updatedCart);
  } catch (error) {
    logger.error(`Failed to add product to cart: ${error.message}`);
    reply.status(500).send({ error: "Failed to add product to cart" });
  }
};

export const deleteProductFromCart = async (req, reply) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    logger.info(
      `Deleting product ${productId} from cart for user ID: ${userId}`,
    );

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      reply.status(404).send({ error: "Cart not found" });
      return;
    }

    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId,
    );

    if (!existingCartItem) {
      reply.status(404).send({ error: "Product not found in cart" });
      return;
    }

    await prisma.cartItem.delete({
      where: { id: existingCartItem.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    logger.info(
      `Product ${productId} deleted from cart for user ID: ${userId}`,
    );
    reply.status(200).send(updatedCart);
  } catch (error) {
    logger.error(`Failed to delete product from cart: ${error.message}`);
    reply.status(500).send({ error: "Failed to delete product from cart" });
  }
};

export const incrementQuantityToCart = async (req, reply) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    logger.info(
      `Incrementing quantity by 1 for product ${productId} in cart for user ID: ${userId}`,
    );

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      reply.status(404).send({ error: "Cart not found" });
      return;
    }

    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId,
    );

    if (!existingCartItem) {
      reply.status(404).send({ error: "Product not found in cart" });
      return;
    }

    await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity + 1 },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    logger.info(
      `Quantity incremented by 1 for product ${productId} in cart for user ID: ${userId}`,
    );
    reply.status(200).send(updatedCart);
  } catch (error) {
    logger.error(
      `Failed to increment quantity for product in cart: ${error.message}`,
    );
    reply.status(500).send({
      error: "Failed to increment quantity for product in cart",
    });
  }
};

export const decrementQuantityFromCart = async (req, reply) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    logger.info(
      `Decrementing quantity by 1 for product ${productId} in cart for user ID: ${userId}`,
    );

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      reply.status(404).send({ error: "Cart not found" });
      return;
    }

    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId,
    );

    if (!existingCartItem) {
      reply.status(404).send({ error: "Product not found in cart" });
      return;
    }

    const newQuantity = existingCartItem.quantity - 1;
    if (newQuantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: existingCartItem.id },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    logger.info(
      `Quantity decremented by 1 for product ${productId} in cart for user ID: ${userId}`,
    );
    reply.status(200).send(updatedCart);
  } catch (error) {
    logger.error(
      `Failed to decrement quantity from product in cart: ${error.message}`,
    );
    reply.status(500).send({
      message: "Failed to decrement quantity from product in cart",
      error: error,
    });
  }
};
