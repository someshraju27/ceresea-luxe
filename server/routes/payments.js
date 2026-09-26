import express from "express";
import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import protect from "../middleware/authMiddleware.js";

import {
  sendOrderConfirmationEmail,
  sendNewOrderAdminEmail,
  sendPaymentFailedEmail,
} from "../services/emailService.js";

const router = express.Router();

// ---------------------------------------------
// Create Razorpay Order
// ---------------------------------------------

router.post(
  "/create-order/:orderId",
  protect,
  async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (order.paymentStatus === "paid") {
        return res.status(400).json({
          message: "Order is already paid",
        });
      }

      const razorpayOrder =
        await razorpay.orders.create({
          amount: order.totalAmount * 100,
          currency: "INR",
          receipt: order._id.toString(),
          notes: {
            cereseaOrderId:
              order._id.toString(),

            userId:
              req.user._id.toString(),
          },
        });

      order.razorpayOrderId =
        razorpayOrder.id;

      await order.save();

      res.status(201).json({
        message:
          "Razorpay order created successfully",

        razorpayOrderId:
          razorpayOrder.id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        keyId:
          process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error(
        "Create Razorpay order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create Razorpay order",
      });
    }
  }
);

// ---------------------------------------------
// Verify Razorpay Payment
// ---------------------------------------------

router.post(
  "/verify",
  protect,
  async (req, res) => {
    try {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        cereseaOrderId,
      } = req.body;

      // Check required data
      if (
        !razorpay_payment_id ||
        !razorpay_order_id ||
        !razorpay_signature ||
        !cereseaOrderId
      ) {
        return res.status(400).json({
          message:
            "Payment verification data is incomplete",
        });
      }

      // Find our Ceresea order
      const order = await Order.findOne({
        _id: cereseaOrderId,
        user: req.user._id,
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Make sure Razorpay order matches
      if (
        order.razorpayOrderId !==
        razorpay_order_id
      ) {
        return res.status(400).json({
          message:
            "Razorpay order mismatch",
        });
      }

      // Generate expected signature
      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${order.razorpayOrderId}|${razorpay_payment_id}`
          )
          .digest("hex");

      // Compare signatures
      if (
        generatedSignature !==
        razorpay_signature
      ) {
        return res.status(400).json({
          message:
            "Invalid payment signature",
        });
      }

      // Fetch payment from Razorpay
      const payment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );

      // Verify Razorpay order
      if (
        payment.order_id !==
        order.razorpayOrderId
      ) {
        return res.status(400).json({
          message:
            "Payment order mismatch",
        });
      }

      // Verify currency
      if (payment.currency !== "INR") {
        return res.status(400).json({
          message:
            "Payment currency mismatch",
        });
      }

      // Verify amount
      if (
        payment.amount !==
        order.totalAmount * 100
      ) {
        return res.status(400).json({
          message:
            "Payment amount mismatch",
        });
      }

      // Verify captured status
      if (
        payment.status !== "captured"
      ) {
        return res.status(400).json({
          message:
            `Payment is not captured. Current status: ${payment.status}`,
        });
      }

      // If webhook already processed the payment,
      // simply return success.
      if (order.paymentStatus === "paid") {
        return res.status(200).json({
          message:
            "Payment already verified",

          order: {
            id: order._id,
            paymentStatus:
              order.paymentStatus,
            orderStatus:
              order.orderStatus,
          },
        });
      }

      // Update our order
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.razorpayPaymentId =
        razorpay_payment_id;

      await order.save();

      console.log(
        `Order ${order._id} verified and marked as paid`
      );

      res.status(200).json({
        message:
          "Payment verified successfully",

        order: {
          id: order._id,
          paymentStatus:
            order.paymentStatus,
          orderStatus:
            order.orderStatus,
        },
      });
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      res.status(500).json({
        message:
          "Payment verification failed",
      });
    }
  }
);

// ---------------------------------------------
// Razorpay Webhook
// ---------------------------------------------

router.post(
  "/webhook",
  async (req, res) => {
    try {
      const webhookSignature =
        req.headers["x-razorpay-signature"];

      if (!webhookSignature) {
        console.error(
          "Webhook signature missing"
        );

        return res.status(400).json({
          message:
            "Webhook signature missing",
        });
      }

      if (!req.rawBody) {
        console.error(
          "Raw webhook body missing"
        );

        return res.status(400).json({
          message:
            "Raw webhook body missing",
        });
      }

      if (
        !process.env.RAZORPAY_WEBHOOK_SECRET
      ) {
        console.error(
          "RAZORPAY_WEBHOOK_SECRET is not configured"
        );

        return res.status(500).json({
          message:
            "Webhook secret is not configured",
        });
      }

      // Verify Razorpay webhook signature
      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_WEBHOOK_SECRET
          )
          .update(req.rawBody)
          .digest("hex");

      if (
        generatedSignature !==
        webhookSignature
      ) {
        console.error(
          "Invalid webhook signature"
        );

        return res.status(400).json({
          message:
            "Invalid webhook signature",
        });
      }

      const event = req.body;

      console.log(
        `Razorpay webhook received: ${event.event}`
      );

      // --------------------------------------------------
      // PAYMENT CAPTURED
      // --------------------------------------------------

      if (
        event.event === "payment.captured"
      ) {
        const payment =
          event.payload?.payment?.entity;

        if (!payment) {
          console.error(
            "Payment data missing from webhook"
          );

          return res.status(400).json({
            message:
              "Payment data missing",
          });
        }

        const razorpayOrderId =
          payment.order_id;

        const razorpayPaymentId =
          payment.id;

        if (
          !razorpayOrderId ||
          !razorpayPaymentId
        ) {
          console.error(
            "Razorpay payment/order ID missing"
          );

          return res.status(400).json({
            message:
              "Payment identifiers missing",
          });
        }

        const order =
          await Order.findOne({
            razorpayOrderId,
          });

        // Unknown orders should not cause
        // endless Razorpay retries.
        if (!order) {
          console.error(
            "Ceresea order not found for Razorpay order:",
            razorpayOrderId
          );

          return res.status(200).json({
            message:
              "Webhook received; order not found",
          });
        }

        // Verify currency
        if (payment.currency !== "INR") {
          console.error(
            "Webhook currency mismatch"
          );

          return res.status(400).json({
            message:
              "Payment currency mismatch",
          });
        }

        // Verify amount
        if (
          payment.amount !==
          order.totalAmount * 100
        ) {
          console.error(
            `Webhook amount mismatch for order ${order._id}`
          );

          return res.status(400).json({
            message:
              "Payment amount mismatch",
          });
        }

        // --------------------------------------------------
        // Update order if necessary
        // --------------------------------------------------

        if (
          order.paymentStatus !== "paid"
        ) {
          order.paymentStatus = "paid";
          order.orderStatus = "confirmed";
          order.razorpayPaymentId =
            razorpayPaymentId;

          await order.save();

          console.log(
            `Order ${order._id} marked as paid`
          );
        } else {
          // The frontend /verify route may have
          // already marked the order as paid.
          //
          // Make sure we still have the payment ID.
          if (
            !order.razorpayPaymentId
          ) {
            order.razorpayPaymentId =
              razorpayPaymentId;

            await order.save();
          }

          console.log(
            `Order ${order._id} was already marked as paid`
          );
        }

        // --------------------------------------------------
        // Send customer confirmation email
        // --------------------------------------------------

        if (
          !order.confirmationEmailSent
        ) {
          try {
            await sendOrderConfirmationEmail(
              order
            );

            order.confirmationEmailSent =
              true;

            await order.save();

            console.log(
              `Order confirmation email sent for order ${order._id}`
            );
          } catch (emailError) {
            // Email failure must NOT cause the
            // successful payment webhook to fail.
            console.error(
              `Order confirmation email failed for order ${order._id}:`,
              emailError
            );
          }
        } else {
          console.log(
            `Confirmation email already sent for order ${order._id}`
          );
        }

        // --------------------------------------------------
        // Send admin new-order email
        // --------------------------------------------------

        try {
          await sendNewOrderAdminEmail(
            order
          );

          console.log(
            `Admin order email sent for order ${order._id}`
          );
        } catch (emailError) {
          // Admin email failure must NOT cause
          // the successful payment webhook to fail.
          console.error(
            `Admin order email failed for order ${order._id}:`,
            emailError
          );
        }

        return res.status(200).json({
          message:
            "Payment captured successfully",
        });
      }

      // --------------------------------------------------
      // PAYMENT FAILED
      // --------------------------------------------------

      if (
        event.event === "payment.failed"
      ) {
        const payment =
          event.payload?.payment?.entity;

        if (!payment?.order_id) {
          console.error(
            "Payment failure data missing"
          );

          return res.status(400).json({
            message:
              "Payment failure data missing",
          });
        }

        const order =
          await Order.findOne({
            razorpayOrderId:
              payment.order_id,
          });

        // Unknown orders shouldn't cause
        // endless webhook retries.
        if (!order) {
          console.error(
            "Ceresea order not found for failed payment:",
            payment.order_id
          );

          return res.status(200).json({
            message:
              "Webhook received; order not found",
          });
        }

        // Never turn an already-paid order
        // into failed.
        if (
          order.paymentStatus === "paid"
        ) {
          console.log(
            `Ignoring failed event for already-paid order ${order._id}`
          );

          return res.status(200).json({
            message:
              "Order is already paid",
          });
        }

        // Update payment status
        order.paymentStatus = "failed";

        await order.save();

        console.log(
          `Order ${order._id} payment marked as failed`
        );

        // --------------------------------------------------
        // Send payment failed email
        // --------------------------------------------------

        if (
          !order.paymentFailedEmailSent
        ) {
          try {
            await sendPaymentFailedEmail(
              order
            );

            order.paymentFailedEmailSent =
              true;

            await order.save();

            console.log(
              `Payment failed email sent for order ${order._id}`
            );
          } catch (emailError) {
            // Email failure must NOT cause the
            // Razorpay webhook to fail.
            console.error(
              `Payment failed email failed for order ${order._id}:`,
              emailError
            );
          }
        } else {
          console.log(
            `Payment failed email already sent for order ${order._id}`
          );
        }

        return res.status(200).json({
          message:
            "Payment failure processed",
        });
      }

      // --------------------------------------------------
      // OTHER EVENTS
      // --------------------------------------------------

      return res.status(200).json({
        message:
          "Webhook event received",
      });
    } catch (error) {
      console.error(
        "Razorpay webhook error:",
        error
      );

      return res.status(500).json({
        message:
          "Webhook processing failed",
      });
    }
  }
);

export default router;