import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: String,
          required: true,
        },

        productName: {
          type: String,
          required: true,
        },

        shadeId: {
          type: String,
          required: true,
        },

        shadeName: {
          type: String,
          required: true,
        },

        shadeColor: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    contact: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    shippingAddress: {
      doorNumber: {
        type: String,
        required: true,
        trim: true,
      },

      street: {
        type: String,
        required: true,
        trim: true,
      },

      landmark: {
        type: String,
        required : true,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    refundStatus: {
      type: String,
      enum: [
        "not_requested",
        "pending",
        "processed",
        "failed",
      ],
      default: "not_requested",
    },

    razorpayRefundId: {
      type: String,
      default: "",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    // Email tracking
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },

    paymentFailedEmailSent: {
      type: Boolean,
      default: false,
    },

    deliveryEmailSent: {
      type: Boolean,
      default: false,
    },

    cancellationEmailSent: {
      type: Boolean,
      default: false,
    },

    refundEmailSent: {
      type: Boolean,
      default: false,
    },

    // Expected delivery window
    expectedDeliveryFrom: {
      type: Date,
      default: null,
    },

    expectedDeliveryTo: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;