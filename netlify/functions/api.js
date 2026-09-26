import serverless from "serverless-http";

import app from "../../server/app.js";
import connectDB from "../../server/config/db.js";

console.log(
  "RAZORPAY_KEY_ID exists:",
  Boolean(process.env.RAZORPAY_KEY_ID)
);

const expressHandler = serverless(app);

export const handler = async (event, context) => {
  await connectDB();
  return expressHandler(event, context);
};