const express = require("express");
const { userAuth } = require("../middlewares/auth");
const PaymentRouter = express.Router();
const razorPayInstance = require("../utils/razorpay");

PaymentRouter.post("/payment/create", userAuth, (req, res) => {
  try {
    const order = await razorPayInstance.orders.create({
        amount:70000,
        currency:"INR",
        receipt: "order_rcptid_11",
        partial_payment: false,
        notes:{
            firstName:"Kiran",
            lastName:"DM",
            membership:"Gold"
        }
    });
    

  } catch (err) {
    console.error(err);
  }
});

module.exports = PaymentRouter;
