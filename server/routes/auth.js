import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// GOOGLE LOGIN
// ==========================================

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      name,
      email,
      picture,
    } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        profilePicture: picture,
      });
    } else {
      user.name = name;
      user.email = email;
      user.profilePicture = picture;

      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Google login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error(
      "Google authentication error:",
      error
    );

    res.status(401).json({
      message: "Google authentication failed",
    });
  }
});
// ==========================================
// UPDATE PHONE NUMBER
// ==========================================

router.put("/phone", protect, async (req, res) => {
  try {
    const { phone } = req.body;

    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (!cleanPhone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit mobile number",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.phone = cleanPhone;

    await user.save();

    res.status(200).json({
      message: "Phone number updated successfully",
      phone: user.phone,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Update phone error:", error);

    res.status(500).json({
      message: "Failed to update phone number",
    });
  }
});
// ==========================================
// GET SAVED ADDRESSES
// ==========================================

router.get("/addresses", protect, async (req, res) => {
  try {
    res.status(200).json({
      addresses: req.user.addresses || [],
    });
  } catch (error) {
    console.error(
      "Get addresses error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch saved addresses",
    });
  }
});

// ==========================================
// ADD SAVED ADDRESS
// ==========================================

router.post("/addresses", protect, async (req, res) => {
  try {
    const {
      doorNumber,
      street,
      landmark,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !doorNumber ||
      !street ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message:
          "Door number, street, city, state and pincode are required",
      });
    }

    if (!/^\d{6}$/.test(String(pincode))) {
      return res.status(400).json({
        message: "Pincode must be exactly 6 digits",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.addresses.push({
      doorNumber: String(doorNumber).trim(),
      street: String(street).trim(),
      landmark: landmark
        ? String(landmark).trim()
        : "",
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
    });

    await user.save();

    const newAddress =
      user.addresses[user.addresses.length - 1];

    res.status(201).json({
      message: "Address saved successfully",
      address: newAddress,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error(
      "Add address error:",
      error
    );

    res.status(500).json({
      message: "Failed to save address",
    });
  }
});

// ==========================================
// DELETE SAVED ADDRESS
// ==========================================

router.delete(
  "/addresses/:addressId",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const addressIndex =
        user.addresses.findIndex(
          (address) =>
            address._id.toString() ===
            req.params.addressId
        );

      if (addressIndex === -1) {
        return res.status(404).json({
          message: "Address not found",
        });
      }

      user.addresses.splice(addressIndex, 1);

      await user.save();

      res.status(200).json({
        message: "Address deleted successfully",
        addresses: user.addresses,
      });
    } catch (error) {
      console.error(
        "Delete address error:",
        error
      );

      res.status(500).json({
        message: "Failed to delete address",
      });
    }
  }
);

export default router;