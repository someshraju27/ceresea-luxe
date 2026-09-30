import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);


app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/api/payments/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Ceresea API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ceresea API is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

export default app;