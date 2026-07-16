const express = require("express");
const { userAuth } = require("../middlewares/auth");
const razorPayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constant");
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
      message: "Error while creating payment order " + error.message,
    });
  }
});

module.exports = PaymentRouter;
