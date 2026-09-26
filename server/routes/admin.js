import express from "express";

import Order from "../models/Order.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import razorpay from "../config/razorpay.js";

import {
  sendDeliveryConfirmationEmail,
  sendCancellationEmail,
} from "../services/emailService.js";

const router = express.Router();

// Verify admin access
router.get("/verify", protect, admin, (req, res) => {
  res.status(200).json({
    message: "Admin access verified",
    admin: {
      name: req.user.name,
      email: req.user.email,
    },
  });
});

// Admin dashboard
router.get(
  "/dashboard",
  protect,
  admin,
  async (req, res) => {
    try {
      const [
        totalOrders,
        paidOrders,
        processingOrders,
        pendingOrders,
        revenueResult,
        recentOrders,
      ] = await Promise.all([
        Order.countDocuments(),

        Order.countDocuments({
          paymentStatus: "paid",
        }),

        Order.countDocuments({
          orderStatus: "processing",
        }),

        Order.countDocuments({
          orderStatus: "pending",
        }),

        Order.aggregate([
          {
            $match: {
              paymentStatus: "paid",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$totalAmount",
              },
            },
          },
        ]),

        Order.find()
          .populate("user", "name email")
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

      const revenue =
        revenueResult.length > 0
          ? revenueResult[0].total
          : 0;

      res.status(200).json({
        stats: {
          totalOrders,
          paidOrders,
          processingOrders,
          pendingOrders,
          revenue,
        },

        recentOrders,
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      res.status(500).json({
        message: "Failed to load admin dashboard",
      });
    }
  }
);

// Get all orders
router.get(
  "/orders",
  protect,
  admin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        orders,
      });
    } catch (error) {
      console.error(
        "Get admin orders error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch orders",
      });
    }
  }
);

// Get a single order
router.get(
  "/orders/:orderId",
  protect,
  admin,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.orderId
      ).populate("user", "name email");

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      res.status(200).json({
        order,
      });
    } catch (error) {
      console.error(
        "Get admin order error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch order",
      });
    }
  }
);

// Update expected delivery window
router.patch(
  "/orders/:orderId/delivery-date",
  protect,
  admin,
  async (req, res) => {
    try {
      const {
        expectedDeliveryFrom,
        expectedDeliveryTo,
      } = req.body;

      if (
        !expectedDeliveryFrom ||
        !expectedDeliveryTo
      ) {
        return res.status(400).json({
          message:
            "Both expected delivery dates are required",
        });
      }

      const fromDate = new Date(
        expectedDeliveryFrom
      );

      const toDate = new Date(
        expectedDeliveryTo
      );

      if (
        Number.isNaN(fromDate.getTime()) ||
        Number.isNaN(toDate.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid delivery dates",
        });
      }

      if (fromDate > toDate) {
        return res.status(400).json({
          message:
            "Expected delivery start date cannot be after the end date",
        });
      }

      const order = await Order.findById(
        req.params.orderId
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Do not allow delivery dates to be changed
      // after the order has been delivered or cancelled.
      if (
        order.orderStatus === "delivered" ||
        order.orderStatus === "cancelled"
      ) {
        return res.status(400).json({
          message: `Delivery date cannot be changed for ${order.orderStatus} orders`,
        });
      }

      order.expectedDeliveryFrom = fromDate;
      order.expectedDeliveryTo = toDate;

      await order.save();

      res.status(200).json({
        message:
          "Expected delivery date updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Update delivery date error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update expected delivery date",
      });
    }
  }
);

// Update order status
router.patch(
  "/orders/:orderId/status",
  protect,
  admin,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(
        req.params.orderId
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Failed payment orders cannot be updated
      if (order.paymentStatus === "failed") {
        return res.status(400).json({
          message:
            "Failed payment orders cannot be updated",
        });
      }

      // Delivered and cancelled orders are permanently locked
      if (
        order.orderStatus === "delivered" ||
        order.orderStatus === "cancelled"
      ) {
        return res.status(400).json({
          message: `${order.orderStatus} orders cannot be changed`,
        });
      }

      // ---------------------------------------------
      // CANCELLATION
      // ---------------------------------------------

      if (status === "cancelled") {
        if (order.paymentStatus !== "paid") {
          return res.status(400).json({
            message:
              "Only paid orders can be cancelled",
          });
        }

        order.orderStatus = "cancelled";

        await order.save();

        // Send cancellation email
        // Email failure should not undo cancellation.
        if (!order.cancellationEmailSent) {
          try {
            await sendCancellationEmail(order);

            order.cancellationEmailSent = true;

            await order.save();
          } catch (emailError) {
            console.error(
              "Cancellation email failed:",
              emailError
            );
          }
        }

        return res.status(200).json({
          message: "Order cancelled successfully",
          order,
        });
      }

      // ---------------------------------------------
      // ORDER STATUS PROGRESSION
      // ---------------------------------------------

      const statusOrder = {
        pending: 0,
        confirmed: 1,
        processing: 2,
        shipped: 3,
        delivered: 4,
      };

      const currentStatus =
        statusOrder[order.orderStatus];

      const newStatus =
        statusOrder[status];

      // Prevent moving backwards
      if (newStatus <= currentStatus) {
        return res.status(400).json({
          message: `Order cannot move from ${order.orderStatus} to ${status}`,
        });
      }

      order.orderStatus = status;

      await order.save();

      // ---------------------------------------------
      // DELIVERY CONFIRMATION EMAIL
      // ---------------------------------------------

      if (
        status === "delivered" &&
        !order.deliveryEmailSent
      ) {
        try {
          await sendDeliveryConfirmationEmail(order);

          order.deliveryEmailSent = true;

          await order.save();
        } catch (emailError) {
          console.error(
            "Delivery confirmation email failed:",
            emailError
          );
        }
      }

      res.status(200).json({
        message:
          "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update order status",
      });
    }
  }
);

// Refund a paid cancelled order
router.post(
  "/orders/:orderId/refund",
  protect,
  admin,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.orderId
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Refunds are only allowed for cancelled orders
      if (order.orderStatus !== "cancelled") {
        return res.status(400).json({
          message:
            "Only cancelled orders can be refunded",
        });
      }

      // Payment must have been successful
      if (order.paymentStatus !== "paid") {
        return res.status(400).json({
          message:
            "Only paid orders can be refunded",
        });
      }

      // Prevent duplicate refund requests
      if (
        order.refundStatus === "processed" ||
        order.paymentStatus === "refunded"
      ) {
        return res.status(400).json({
          message:
            "Order has already been refunded",
        });
      }

      if (!order.razorpayPaymentId) {
        return res.status(400).json({
          message:
            "Razorpay payment ID is missing",
        });
      }

      // Mark refund as pending before calling Razorpay
      order.refundStatus = "pending";

      await order.save();

      try {
        const refund =
          await razorpay.payments.refund(
            order.razorpayPaymentId,
            {
              amount:
                order.totalAmount * 100,

              notes: {
                cereseaOrderId:
                  order._id.toString(),
              },
            }
          );

        order.refundStatus = "processed";
        order.razorpayRefundId = refund.id;
        order.paymentStatus = "refunded";

        await order.save();

        return res.status(200).json({
          message:
            "Refund processed successfully",

          order,

          refund: {
            id: refund.id,
            amount: refund.amount,
            status: refund.status,
          },
        });
      } catch (refundError) {
        console.error(
          "Razorpay refund error:",
          refundError
        );

        order.refundStatus = "failed";

        await order.save();

        return res.status(500).json({
          message:
            "Refund processing failed",
        });
      }
    } catch (error) {
      console.error(
        "Refund order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to process refund",
      });
    }
  }
);

export default router;