const express = require("express");
const { userAuth } = require("../middlewares/auth");
const razorPayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constant");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const PaymentRouter = express.Router();

PaymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;
    const order = await razorPayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "order_rcptid_11",
      partial_payment: false,
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();
    res.status(200).json({
      message: "payment order created successfully",
      ...savedPayment.toJSON(),
      keyId: process.env.RAZOR_PAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while creating payment order " + err.message,
    });
  }
});

PaymentRouter.post("/payment/webhook", async (req, res) => {
  const webhookSignature = req.get("X-Razorpay-Signature");
  const isWebhookValid = validateWebhookSignature(
    JSON.stringify(req.body),
    webhookSignature,
    process.env.RAZORPAY_WEBHOOK_SECRET,
  );

  if (!isWebhookValid) {
    return res.status(400).json({
      message: "Webhook is invalid",
    });
  }

  const paymentDetails = req.body.payload.payment.entity;

  const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
  payment.status = paymentDetails.status;
  await payment.save();

  const user = await User.findOne({ _id: payment.userId });
  user.isPremium = true;
  user.membershipType = payment.notes.membershipType;
  await user.save();

  if (req.body.event === "payment.captured") {
  } else if (req.body.event === "payment.failed") {
  }

  return res.status(200).json({
    message: "Webhook received successfully",
  });
});

PaymentRouter.post("/payment/verify", userAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid Payment Signature",
      });
    }
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    payment.paymentId = razorpay_payment_id;
    payment.status = "captured";

    await payment.save();

    await User.findByIdAndUpdate(payment.userId, {
      isPremium: true,
      membershipType: payment.notes.membershipType,
    });

    res.json({
      success: true,
      message: "Payment Verified Successfully",
      ...user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error While Verifying Payment" + err.message,
    });
  }
  // const user = req.user.toJSON();
  // if (user.isPremium) {
  //   return res.status(200).json({ ...user });
  // }
  // return res.status(400).json({ ...user });
});

module.exports = PaymentRouter;
