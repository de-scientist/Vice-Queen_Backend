import { PrismaClient } from "@prisma/client";
import { logger } from "../middlewares/logging.middlewares.js";
import {
  generateMpesaToken,
  initiateMpesaPayment,
} from "../../utils/mpesaPayment.js";
import stripePaymentService from "../../utils/stripePayment.js";
import { z } from "zod";

const prisma = new PrismaClient();

const paymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  paymentMethod: z.enum(["credit_card", "mpesa"]),
  amount: z.number().positive("Amount must be a positive number"),
  phoneNo: z
    .string()
    .regex(
      /^254\d{9}$/,
      "Phone number must start with 254 followed by 9 digits",
    )
    .optional(),
});

export const createPayment = async (req, reply) => {
  try {
    const { orderId, phoneNo, paymentMethod, amount } = paymentSchema.parse(
      req.body,
    );
    logger.info("Starting to create a new payment");
    if (paymentMethod === "mpesa") {
      if (!phoneNo) {
        throw new Error("Phone number is required for M-Pesa payments");
      }
      const token = await generateMpesaToken();
      const phoneNumber = phoneNo.startsWith("254")
        ? phoneNo
        : `254${phoneNo.substring(1)}`;
      const mpesaResponse = await initiateMpesaPayment(
        phoneNumber,
        amount,
        token,
      );

      if (mpesaResponse.ResponseCode !== "0") {
        throw new Error(mpesaResponse.ResponseDescription);
      }

      const payment = await prisma.payment.create({
        data: {
          orderId,
          paymentMethod,
          paymentDate: new Date(),
          status: "pending",
          // mpesaPaymentId: mpesaResponse.CheckoutRequestId
        },
      });

      logger.info(`Payment created successfully with ID: ${payment.id}`);
      reply.status(201).send(payment);
    } else {
      // Handle other payment methods
      const stripeResponse = await stripePaymentService.createPaymentIntent(
        amount,
        "usd",
      );
      if (!stripeResponse.success) {
        reply.status(400).send(stripeResponse.error);
      }

      const payment = await prisma.payment.create({
        data: {
          orderId,
          paymentMethod,
          paymentDate: new Date(),
          status: "pending",
          // stripePaymentId: stripeResponse.paymentId,
        },
      });

      
      logger.info(`Payment created successfully with ID: ${payment.id}`);

      // Confirm the payment
      const confirmResponse = await stripePaymentService.confirmPayment(stripeResponse.paymentId, req.body.paymentMethodId);
      if (confirmResponse.status === "succeeded") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "completed" },
        });
      } else {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });
      }
      reply.status(201).send(payment);
    }
  } catch (error) {
    console.error(error);
    logger.error(`Failed to create payment: ${error.message}`);
    reply
      .status(500)
      .send({ message: "Failed to create payment", error: error });
  }
};

export const mpesaCallback = async (req, reply) => {
  try {
    const {
      Body: { stkCallback },
    } = req.body;
    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    logger.info(
      `Mpesa callback received for CheckoutRequestID: ${CheckoutRequestID}`,
    );

    if (ResultCode === 0) {
      await prisma.payment.update({
        where: { mpesaPaymentId: CheckoutRequestID },
        data: { status: "successful" },
      });
      logger.info(
        `Payment with CheckoutRequestID: ${CheckoutRequestID} updated to successful`,
      );
    } else {
      await prisma.payment.update({
        where: { mpesaPaymentId: CheckoutRequestID },
        data: { status: "failed", failureReason: ResultDesc },
      });
      logger.info(
        `Payment with CheckoutRequestID: ${CheckoutRequestID} updated to failed`,
      );
    }

    reply.status(200).send({ message: "Callback processed successfully" });
  } catch (error) {
    logger.error(`Failed to process Mpesa callback: ${error.message}`);
    reply.status(500).send({ error: "Failed to process callback" });
  }
};

export const getPayments = async (req, reply) => {
  try {
    logger.info("Fetching all payments");
    const payments = await prisma.payment.findMany();

    logger.info(`Fetched ${payments.length} payments`);
    reply.status(200).send(payments);
  } catch (error) {
    logger.error(`Failed to fetch payments: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch payments" });
  }
};

export const getPaymentById = async (req, reply) => {
  try {
    const paymentId = req.params.id;
    logger.info(`Fetching payment with ID: ${paymentId}`);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      reply.status(404).send({ error: "Payment not found" });
    } else {
      logger.info(`Fetched payment with ID: ${payment.id}`);
      reply.status(200).send(payment);
    }
  } catch (error) {
    logger.error(`Failed to fetch payment: ${error.message}`);
    reply.status(500).send({ error: "Failed to fetch payment" });
  }
};
