import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORT_CODE,
  passKey: process.env.MPESA_PASS_KEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
};

export const generateMpesaToken = async () => {
  const auth = Buffer.from(
    `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`,
  ).toString("base64");
  try {
    const response = await axios.get(
      " https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      },
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const initiateMpesaPayment = async (phoneNumber, amount, token) => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);
  const password = Buffer.from(
    `${mpesaConfig.shortCode}${mpesaConfig.passKey}${timestamp}`,
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: mpesaConfig.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: mpesaConfig.shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: mpesaConfig.callbackUrl,
        AccountReference: "Vice Queen Industries",
        TransactionDesc: "Payment for order",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
