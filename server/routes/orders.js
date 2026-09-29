import express from "express";

import Order from "../models/Order.js";
import protect from "../middleware/authMiddleware.js";
import razorpay from "../config/razorpay.js";

const router = express.Router();

const CERESSEA_PRODUCT = {
  id: "ceresea",
  name: "Ceresea",
  price: 120,
};

const VALID_SHADES = {
  strawberry: {
    name: "Strawberry",
    color: "#D52B32",
  },

  lemon: {
    name: "Lemon",
    color: "#E5B719",
  },

  blueberry: {
    name: "Blue Berry",
    color: "#159DB8",
  },

  "rose-blush": {
    name: "Rose Blush",
    color: "#E63E82",
  },

  "green-apple": {
    name: "Green Apple",
    color: "#83C52A",
  },

  purple: {
    name: "Purple",
    color: "#9A63B7",
  },
};

// Get logged-in user's orders
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,

      orderStatus: {
        $in: [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ],
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

// Get a specific logged-in user's order
router.get("/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
});

// Create order
router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      contact,
      shippingAddress,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item",
      });
    }

    if (!contact || !shippingAddress) {
      return res.status(400).json({
        message: "Contact and shipping address are required",
      });
    }

    const validatedItems = items.map((item) => {
      if (item.productId !== CERESSEA_PRODUCT.id) {
        throw new Error("Invalid product");
      }

      const shade = VALID_SHADES[item.shadeId];

      if (!shade) {
        throw new Error("Invalid shade");
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid quantity");
      }

      return {
        productId: CERESSEA_PRODUCT.id,
        productName: CERESSEA_PRODUCT.name,
        shadeId: item.shadeId,
        shadeName: shade.name,
        shadeColor: shade.color,
        image: item.image,
        quantity,
        price: CERESSEA_PRODUCT.price,
      };
    });

    const calculatedTotal = validatedItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    // ---------------------------------------------
    // Default expected delivery window
    // 3–5 days from order creation
    // ---------------------------------------------

    const expectedDeliveryFrom = new Date();

    expectedDeliveryFrom.setDate(
      expectedDeliveryFrom.getDate() + 3
    );

    const expectedDeliveryTo = new Date();

    expectedDeliveryTo.setDate(
      expectedDeliveryTo.getDate() + 5
    );

    const order = await Order.create({
      user: req.user._id,

      items: validatedItems,

      contact: {
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
      },

      shippingAddress: {
        doorNumber: shippingAddress.doorNumber,
        street: shippingAddress.street,
        landmark: shippingAddress.landmark,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },

      totalAmount: calculatedTotal,

      expectedDeliveryFrom,
      expectedDeliveryTo,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(400).json({
      message:
        error.message ||
        "Failed to create order",
    });
  }
});

// Cancel an order
router.post(
  "/:orderId/cancel",
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

      // Customer can cancel ONLY confirmed orders.
      if (order.orderStatus !== "confirmed") {
        return res.status(400).json({
          message: `Order cannot be cancelled because it is already ${order.orderStatus}`,
        });
      }

      // Failed payment orders cannot be cancelled.
      if (order.paymentStatus === "failed") {
        return res.status(400).json({
          message: "Failed payment orders cannot be cancelled",
        });
      }

      // If payment was successful, process refund.
      if (
        order.paymentStatus === "paid" &&
        order.razorpayPaymentId
      ) {
        try {
          order.refundStatus = "pending";

          await order.save();

          const refund =
            await razorpay.payments.refund(
              order.razorpayPaymentId,
              {
                amount:
                  order.totalAmount * 100,

                speed: "normal",

                notes: {
                  cereseaOrderId:
                    order._id.toString(),

                  reason:
                    "Customer cancelled order",
                },
              }
            );

          order.paymentStatus = "refunded";
          order.refundStatus = "processed";
          order.razorpayRefundId = refund.id;
          order.orderStatus = "cancelled";

          await order.save();

          return res.status(200).json({
            message:
              "Order cancelled and refund initiated successfully",

            order,
          });
        } catch (refundError) {
          console.error(
            "Refund error:",
            refundError
          );

          order.refundStatus = "failed";

          await order.save();

          return res.status(500).json({
            message:
              "Order could not be cancelled because the refund could not be processed",
          });
        }
      }

      // If payment was not successful,
      // no refund is required.
      order.orderStatus = "cancelled";

      await order.save();

      return res.status(200).json({
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      res.status(500).json({
        message: "Failed to cancel order",
      });
    }
  }
);

export default router;