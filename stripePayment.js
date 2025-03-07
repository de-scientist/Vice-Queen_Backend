import Stripe from "stripe";
import dotenv from "dotenv";
import { logger } from "../src/middlewares/logging.middlewares.js";

dotenv.config();
const secretKey = process.env.STRIPE_SECRET_KEY;

class StripePaymentService {
  constructor() {
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is required in environment variables");
    }
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(amount, currency, metadata = {}) {
    try {
      logger.info(`Initializing the payment through stripe`);
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        payment_method_types: ["card"],
        capture_method: "automatic",
      });
      logger.info(`The card payment has been successful. Thank you`);
      return { success: true, paymentId: paymentIntent.id };
    } catch (error) {
      logger.info(`Processing of the payment failed: ${("Error :", error)}`);
      console.error("Stripe payment failed:", error);
      return { success: false, error: error.message };
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      logger.info(`Confirming a payment.`);
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        },
      );
      logger.info(`The payment ${paymentIntentId} is confirmed. ☑️`);
      return paymentIntent;
    } catch (error) {
      logger.info(
        `An error occured when confirming the payment. ${("Error: ", error)}`,
      );
      console.error("Payment confirmation failed:", error);
      throw new Error("Payment confirmation failed");
    }
  }

  async createRefund(paymentIntentId, amount) {
    try {
      logger.info(
        `Initializing for money refund for ${("ID :", paymentIntentId)}`,
      );
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
      });
      logger.info(`The payment ${paymentIntentId} is successful.`);
      return refund;
    } catch (error) {
      logger.info(
        `Failed to process the refund payment with ${("ID :", error)}`,
      );
      console.error("Refund creation failed:", error);
      throw new Error("Refund processing failed");
    }
  }

  async retrievePaymentIntent(paymentIntentId) {
    try {
      logger.info(`Retrirving payment |${("ID :", paymentIntentId)}`);
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      logger.info(`Successfully retrieved the payment.`);
      return paymentIntent;
    } catch (error) {
      logger.info(`Failed to retive payment ${("Error :", error)}`);
      console.error("Payment intent retrieval failed:", error);
      throw new Error("Payment information retrieval failed");
    }
  }
}

const stripePaymentService = new StripePaymentService();
export default stripePaymentService;
