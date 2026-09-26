import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

// --------------------------------------------------
// CUSTOMER ORDER CONFIRMATION EMAIL
// --------------------------------------------------

export const sendOrderConfirmationEmail = async (
  order
) => {
  if (!order?.contact?.email) {
    throw new Error(
      "Order does not contain a customer email"
    );
  }

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            ${item.productName}
            <br />
            <span style="color: #777; font-size: 13px;">
              ${item.shadeName} × ${item.quantity}
            </span>
          </td>

          <td
            align="right"
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            ${formatCurrency(
              item.price * item.quantity
            )}
          </td>
        </tr>
      `
    )
    .join("");

  const landmark = order.shippingAddress.landmark
    ? `<br />${order.shippingAddress.landmark}`
    : "";

  const shippingAddress = `
    ${order.shippingAddress.doorNumber},
    ${order.shippingAddress.street}
    ${landmark}
    <br />
    ${order.shippingAddress.city},
    ${order.shippingAddress.state}
    <br />
    ${order.shippingAddress.pincode}
  `;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: order.contact.email,

    subject: `Your Ceresea order is confirmed — #${order._id}`,

    html: `
      <!DOCTYPE html>
      <html>
        <body
          style="
            margin: 0;
            padding: 0;
            background: #f7f2ea;
            font-family: Arial, Helvetica, sans-serif;
            color: #2c2522;
          "
        >
          <div
            style="
              max-width: 620px;
              margin: 40px auto;
              background: #ffffff;
              padding: 40px;
            "
          >

            <!-- Brand -->
            <div
              style="
                text-align: center;
                margin-bottom: 36px;
              "
            >
              <div
                style="
                  font-family: Georgia, serif;
                  font-size: 30px;
                  letter-spacing: 4px;
                "
              >
                CERESEA
              </div>

              <div
                style="
                  margin-top: 8px;
                  font-size: 11px;
                  letter-spacing: 2px;
                  color: #9b8178;
                  text-transform: uppercase;
                "
              >
                Everyday Care. A Touch of Luxury.
              </div>
            </div>

            <!-- Heading -->
            <h1
              style="
                margin: 0 0 14px;
                font-family: Georgia, serif;
                font-size: 30px;
                font-weight: normal;
              "
            >
              Your order is confirmed.
            </h1>

            <p
              style="
                font-size: 15px;
                line-height: 1.7;
                color: #665b56;
              "
            >
              Hi ${order.contact.fullName},
            </p>

            <p
              style="
                font-size: 15px;
                line-height: 1.7;
                color: #665b56;
              "
            >
              Thank you for choosing Ceresea.
              Your order has been successfully placed
              and your payment has been received.
            </p>

            <!-- Order number -->
            <div
              style="
                margin: 28px 0;
                padding: 18px;
                background: #f7f2ea;
              "
            >
              <div
                style="
                  font-size: 11px;
                  letter-spacing: 1.5px;
                  text-transform: uppercase;
                  color: #9b8178;
                "
              >
                Order
              </div>

              <div
                style="
                  margin-top: 6px;
                  font-size: 14px;
                "
              >
                #${order._id}
              </div>
            </div>

            <!-- Items -->
            <h2
              style="
                font-family: Georgia, serif;
                font-size: 20px;
                font-weight: normal;
                margin-bottom: 14px;
              "
            >
              Your Ceresea
            </h2>

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                border-collapse: collapse;
                font-size: 14px;
              "
            >
              ${itemsHtml}

              <tr>
                <td
                  style="
                    padding-top: 18px;
                    font-weight: bold;
                  "
                >
                  Total
                </td>

                <td
                  align="right"
                  style="
                    padding-top: 18px;
                    font-weight: bold;
                  "
                >
                  ${formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </table>

            <!-- Shipping -->
            <h2
              style="
                margin-top: 36px;
                font-family: Georgia, serif;
                font-size: 20px;
                font-weight: normal;
              "
            >
              Delivery Address
            </h2>

            <p
              style="
                font-size: 14px;
                line-height: 1.7;
                color: #665b56;
              "
            >
              ${shippingAddress}
            </p>

            <!-- Payment -->
            <div
              style="
                margin-top: 28px;
                padding: 18px;
                border-top: 1px solid #eee;
                border-bottom: 1px solid #eee;
              "
            >
              <div style="font-size: 13px;">
                <strong>Payment:</strong>
                Paid
              </div>

              <div
                style="
                  margin-top: 8px;
                  font-size: 13px;
                "
              >
                <strong>Payment ID:</strong>
                ${order.razorpayPaymentId}
              </div>
            </div>

            <p
              style="
                margin-top: 32px;
                font-size: 14px;
                line-height: 1.7;
                color: #665b56;
              "
            >
              We'll keep you updated as your order
              moves through each stage.
            </p>

            <p
              style="
                margin-top: 32px;
                font-family: Georgia, serif;
                font-size: 18px;
              "
            >
              Thank you for choosing Ceresea.
            </p>

            <!-- Footer -->
            <div
              style="
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 11px;
                line-height: 1.6;
                color: #999;
              "
            >
              Ceresea Luxury Lipcare<br />
              Everyday Care. A Touch of Luxury.
            </div>

          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error(
      "Order confirmation email error:",
      error
    );

    throw new Error(
      "Failed to send order confirmation email"
    );
  }

  console.log(
    `Order confirmation email sent for order ${order._id}`
  );

  return data;
};

// --------------------------------------------------
// ADMIN NEW ORDER EMAIL
// --------------------------------------------------

export const sendNewOrderAdminEmail = async (
  order
) => {
  if (!process.env.ADMIN_EMAIL) {
    throw new Error(
      "ADMIN_EMAIL is not configured"
    );
  }

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            <strong>${item.productName}</strong>
            <br />
            <span style="color: #777; font-size: 13px;">
              ${item.shadeName} × ${item.quantity}
            </span>
          </td>

          <td
            align="right"
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            ${formatCurrency(
              item.price * item.quantity
            )}
          </td>
        </tr>
      `
    )
    .join("");

  const landmark = order.shippingAddress.landmark
    ? `<br />${order.shippingAddress.landmark}`
    : "";

  const shippingAddress = `
    ${order.shippingAddress.doorNumber},
    ${order.shippingAddress.street}
    ${landmark}
    <br />
    ${order.shippingAddress.city},
    ${order.shippingAddress.state}
    <br />
    ${order.shippingAddress.pincode}
  `;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,

    subject: `New Ceresea order — #${order._id}`,

    html: `
      <!DOCTYPE html>
      <html>
        <body
          style="
            margin: 0;
            padding: 0;
            background: #f7f2ea;
            font-family: Arial, Helvetica, sans-serif;
            color: #2c2522;
          "
        >
          <div
            style="
              max-width: 620px;
              margin: 40px auto;
              background: #ffffff;
              padding: 40px;
            "
          >

            <!-- Brand -->
            <div
              style="
                text-align: center;
                margin-bottom: 36px;
              "
            >
              <div
                style="
                  font-family: Georgia, serif;
                  font-size: 30px;
                  letter-spacing: 4px;
                "
              >
                CERESEA
              </div>

              <div
                style="
                  margin-top: 8px;
                  font-size: 11px;
                  letter-spacing: 2px;
                  color: #9b8178;
                  text-transform: uppercase;
                "
              >
                New Order Received
              </div>
            </div>

            <!-- Heading -->
            <h1
              style="
                margin: 0 0 14px;
                font-family: Georgia, serif;
                font-size: 30px;
                font-weight: normal;
              "
            >
              New order received.
            </h1>

            <p
              style="
                font-size: 15px;
                line-height: 1.7;
                color: #665b56;
              "
            >
              A new Ceresea order has been successfully
              paid and confirmed.
            </p>

            <!-- Order -->
            <div
              style="
                margin: 28px 0;
                padding: 18px;
                background: #f7f2ea;
              "
            >
              <div
                style="
                  font-size: 11px;
                  letter-spacing: 1.5px;
                  text-transform: uppercase;
                  color: #9b8178;
                "
              >
                Order
              </div>

              <div
                style="
                  margin-top: 6px;
                  font-size: 14px;
                "
              >
                #${order._id}
              </div>
            </div>

            <!-- Customer -->
            <h2
              style="
                font-family: Georgia, serif;
                font-size: 20px;
                font-weight: normal;
              "
            >
              Customer
            </h2>

            <p
              style="
                font-size: 14px;
                line-height: 1.8;
                color: #665b56;
              "
            >
              <strong>Name:</strong>
              ${order.contact.fullName}
              <br />

              <strong>Email:</strong>
              ${order.contact.email}
              <br />

              <strong>Phone:</strong>
              ${order.contact.phone}
            </p>

            <!-- Items -->
            <h2
              style="
                margin-top: 32px;
                font-family: Georgia, serif;
                font-size: 20px;
                font-weight: normal;
              "
            >
              Order Items
            </h2>

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                border-collapse: collapse;
                font-size: 14px;
              "
            >
              ${itemsHtml}

              <tr>
                <td
                  style="
                    padding-top: 18px;
                    font-weight: bold;
                  "
                >
                  Total
                </td>

                <td
                  align="right"
                  style="
                    padding-top: 18px;
                    font-weight: bold;
                  "
                >
                  ${formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </table>

            <!-- Delivery -->
            <h2
              style="
                margin-top: 36px;
                font-family: Georgia, serif;
                font-size: 20px;
                font-weight: normal;
              "
            >
              Delivery Address
            </h2>

            <p
              style="
                font-size: 14px;
                line-height: 1.7;
                color: #665b56;
              "
            >
              ${shippingAddress}
            </p>

            <!-- Payment -->
            <div
              style="
                margin-top: 28px;
                padding: 18px;
                border-top: 1px solid #eee;
                border-bottom: 1px solid #eee;
              "
            >
              <div style="font-size: 13px;">
                <strong>Payment:</strong>
                Paid
              </div>

              <div
                style="
                  margin-top: 8px;
                  font-size: 13px;
                "
              >
                <strong>Payment ID:</strong>
                ${order.razorpayPaymentId}
              </div>
            </div>

            <!-- Footer -->
            <div
              style="
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 11px;
                line-height: 1.6;
                color: #999;
              "
            >
              Ceresea Luxury Lipcare<br />
              Everyday Care. A Touch of Luxury.
            </div>

          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error(
      "Admin order email error:",
      error
    );

    throw new Error(
      "Failed to send admin order email"
    );
  }

  console.log(
    `Admin order email sent for order ${order._id}`
  );

  return data;
};

// --------------------------------------------------
// CUSTOMER PAYMENT FAILED EMAIL
// --------------------------------------------------

export const sendPaymentFailedEmail = async (
  order
) => {
  if (!order?.contact?.email) {
    throw new Error(
      "Order does not contain a customer email"
    );
  }

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            ${item.productName}
            <br />

            <span
              style="
                color: #777;
                font-size: 13px;
              "
            >
              ${item.shadeName} × ${item.quantity}
            </span>
          </td>

          <td
            align="right"
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            ${formatCurrency(
              item.price * item.quantity
            )}
          </td>
        </tr>
      `
    )
    .join("");

  const { data, error } =
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: order.contact.email,

      subject: `Your Ceresea payment could not be completed — #${order._id}`,

      html: `
        <!DOCTYPE html>
        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #f7f2ea;
              font-family: Arial, Helvetica, sans-serif;
              color: #2c2522;
            "
          >
            <div
              style="
                max-width: 620px;
                margin: 40px auto;
                background: #ffffff;
                padding: 40px;
              "
            >

              <!-- Brand -->
              <div
                style="
                  text-align: center;
                  margin-bottom: 36px;
                "
              >
                <div
                  style="
                    font-family: Georgia, serif;
                    font-size: 30px;
                    letter-spacing: 4px;
                  "
                >
                  CERESEA
                </div>

                <div
                  style="
                    margin-top: 8px;
                    font-size: 11px;
                    letter-spacing: 2px;
                    color: #9b8178;
                    text-transform: uppercase;
                  "
                >
                  Everyday Care. A Touch of Luxury.
                </div>
              </div>

              <!-- Heading -->
              <h1
                style="
                  margin: 0 0 14px;
                  font-family: Georgia, serif;
                  font-size: 30px;
                  font-weight: normal;
                "
              >
                Your payment couldn't be completed.
              </h1>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                Hi ${order.contact.fullName},
              </p>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                We couldn't complete the payment for
                your Ceresea order. Your order has not
                been confirmed and no successful payment
                has been recorded for this order.
              </p>

              <!-- Order -->
              <div
                style="
                  margin: 28px 0;
                  padding: 18px;
                  background: #f7f2ea;
                "
              >
                <div
                  style="
                    font-size: 11px;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: #9b8178;
                  "
                >
                  Order
                </div>

                <div
                  style="
                    margin-top: 6px;
                    font-size: 14px;
                  "
                >
                  #${order._id}
                </div>
              </div>

              <!-- Items -->
              <h2
                style="
                  font-family: Georgia, serif;
                  font-size: 20px;
                  font-weight: normal;
                  margin-bottom: 14px;
                "
              >
                Order Summary
              </h2>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-collapse: collapse;
                  font-size: 14px;
                "
              >
                ${itemsHtml}

                <tr>
                  <td
                    style="
                      padding-top: 18px;
                      font-weight: bold;
                    "
                  >
                    Total
                  </td>

                  <td
                    align="right"
                    style="
                      padding-top: 18px;
                      font-weight: bold;
                    "
                  >
                    ${formatCurrency(
                      order.totalAmount
                    )}
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div
                style="
                  margin-top: 32px;
                  padding: 18px;
                  background: #f7f2ea;
                "
              >
                <p
                  style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #665b56;
                  "
                >
                  Please try your payment again if you
                  would still like to place this order.
                </p>
              </div>

              <p
                style="
                  margin-top: 32px;
                  font-size: 14px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                If you believe this happened because of
                a technical issue, you can try again or
                contact us for assistance.
              </p>

              <!-- Footer -->
              <div
                style="
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  text-align: center;
                  font-size: 11px;
                  line-height: 1.6;
                  color: #999;
                "
              >
                Ceresea Luxury Lipcare<br />
                Everyday Care. A Touch of Luxury.
              </div>

            </div>
          </body>
        </html>
      `,
    });

  if (error) {
    console.error(
      "Payment failed email error:",
      error
    );

    throw new Error(
      "Failed to send payment failed email"
    );
  }

  console.log(
    `Payment failed email sent for order ${order._id}`
  );

  return data;
};

// --------------------------------------------------
// CUSTOMER DELIVERY CONFIRMATION EMAIL
// --------------------------------------------------

export const sendDeliveryConfirmationEmail = async (
  order
) => {
  if (!order?.contact?.email) {
    throw new Error(
      "Order does not contain a customer email"
    );
  }

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            ${item.productName}
            <br />

            <span
              style="
                color: #777;
                font-size: 13px;
              "
            >
              ${item.shadeName} × ${item.quantity}
            </span>
          </td>

          <td
            align="right"
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            ${formatCurrency(
              item.price * item.quantity
            )}
          </td>
        </tr>
      `
    )
    .join("");

  const { data, error } =
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: order.contact.email,

      subject: `Your Ceresea order has been delivered — #${order._id}`,

      html: `
        <!DOCTYPE html>
        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #f7f2ea;
              font-family: Arial, Helvetica, sans-serif;
              color: #2c2522;
            "
          >
            <div
              style="
                max-width: 620px;
                margin: 40px auto;
                background: #ffffff;
                padding: 40px;
              "
            >

              <div
                style="
                  text-align: center;
                  margin-bottom: 36px;
                "
              >
                <div
                  style="
                    font-family: Georgia, serif;
                    font-size: 30px;
                    letter-spacing: 4px;
                  "
                >
                  CERESEA
                </div>

                <div
                  style="
                    margin-top: 8px;
                    font-size: 11px;
                    letter-spacing: 2px;
                    color: #9b8178;
                    text-transform: uppercase;
                  "
                >
                  Everyday Care. A Touch of Luxury.
                </div>
              </div>

              <h1
                style="
                  margin: 0 0 14px;
                  font-family: Georgia, serif;
                  font-size: 30px;
                  font-weight: normal;
                "
              >
                Your order has arrived.
              </h1>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                Hi ${order.contact.fullName},
              </p>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                Your Ceresea order has been
                successfully delivered.
                We hope you enjoy your Ceresea
                experience.
              </p>

              <div
                style="
                  margin: 28px 0;
                  padding: 18px;
                  background: #f7f2ea;
                "
              >
                <div
                  style="
                    font-size: 11px;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: #9b8178;
                  "
                >
                  Order
                </div>

                <div
                  style="
                    margin-top: 6px;
                    font-size: 14px;
                  "
                >
                  #${order._id}
                </div>
              </div>

              <h2
                style="
                  font-family: Georgia, serif;
                  font-size: 20px;
                  font-weight: normal;
                  margin-bottom: 14px;
                "
              >
                Your Ceresea
              </h2>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-collapse: collapse;
                  font-size: 14px;
                "
              >
                ${itemsHtml}

                <tr>
                  <td
                    style="
                      padding-top: 18px;
                      font-weight: bold;
                    "
                  >
                    Total
                  </td>

                  <td
                    align="right"
                    style="
                      padding-top: 18px;
                      font-weight: bold;
                    "
                  >
                    ${formatCurrency(
                      order.totalAmount
                    )}
                  </td>
                </tr>
              </table>

              <div
                style="
                  margin-top: 32px;
                  padding: 18px;
                  background: #f7f2ea;
                "
              >
                <p
                  style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #665b56;
                  "
                >
                  Delivered successfully.
                  Thank you for choosing Ceresea.
                </p>
              </div>

              <p
                style="
                  margin-top: 32px;
                  font-family: Georgia, serif;
                  font-size: 18px;
                "
              >
                Everyday Care. A Touch of Luxury.
              </p>

              <div
                style="
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  text-align: center;
                  font-size: 11px;
                  line-height: 1.6;
                  color: #999;
                "
              >
                Ceresea Luxury Lipcare<br />
                Everyday Care. A Touch of Luxury.
              </div>

            </div>
          </body>
        </html>
      `,
    });

  if (error) {
    console.error(
      "Delivery confirmation email error:",
      error
    );

    throw new Error(
      "Failed to send delivery confirmation email"
    );
  }

  console.log(
    `Delivery confirmation email sent for order ${order._id}`
  );

  return data;
};

// --------------------------------------------------
// CUSTOMER CANCELLATION EMAIL
// --------------------------------------------------

export const sendCancellationEmail = async (
  order
) => {
  if (!order?.contact?.email) {
    throw new Error(
      "Order does not contain a customer email"
    );
  }

  const { data, error } =
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: order.contact.email,

      subject: `Your Ceresea order has been cancelled — #${order._id}`,

      html: `
        <!DOCTYPE html>
        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #f7f2ea;
              font-family: Arial, Helvetica, sans-serif;
              color: #2c2522;
            "
          >
            <div
              style="
                max-width: 620px;
                margin: 40px auto;
                background: #ffffff;
                padding: 40px;
              "
            >

              <div
                style="
                  text-align: center;
                  margin-bottom: 36px;
                "
              >
                <div
                  style="
                    font-family: Georgia, serif;
                    font-size: 30px;
                    letter-spacing: 4px;
                  "
                >
                  CERESEA
                </div>

                <div
                  style="
                    margin-top: 8px;
                    font-size: 11px;
                    letter-spacing: 2px;
                    color: #9b8178;
                    text-transform: uppercase;
                  "
                >
                  Everyday Care. A Touch of Luxury.
                </div>
              </div>

              <h1
                style="
                  margin: 0 0 14px;
                  font-family: Georgia, serif;
                  font-size: 30px;
                  font-weight: normal;
                "
              >
                Your order has been cancelled.
              </h1>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                Hi ${order.contact.fullName},
              </p>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                Your Ceresea order has been
                cancelled successfully.
              </p>

              <div
                style="
                  margin: 28px 0;
                  padding: 18px;
                  background: #f7f2ea;
                "
              >
                <div
                  style="
                    font-size: 11px;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: #9b8178;
                  "
                >
                  Order
                </div>

                <div
                  style="
                    margin-top: 6px;
                    font-size: 14px;
                  "
                >
                  #${order._id}
                </div>
              </div>

              ${
                order.paymentStatus === "paid" ||
                order.paymentStatus === "refunded"
                  ? `
              <p
                style="
                  font-size: 14px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                Since your payment was already completed,
                your refund will be processed and credited
                within <strong>7–10 working days</strong>.
              </p>
                  `
                  : ""
              }

              <p
                style="
                  margin-top: 32px;
                  font-size: 14px;
                  line-height: 1.7;
                  color: #665b56;
                "
              >
                If you have any questions regarding your
                order, please contact us.
              </p>

              <p
                style="
                  margin-top: 32px;
                  font-family: Georgia, serif;
                  font-size: 18px;
                "
              >
                Thank you for choosing Ceresea.
              </p>

              <div
                style="
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  text-align: center;
                  font-size: 11px;
                  line-height: 1.6;
                  color: #999;
                "
              >
                Ceresea Luxury Lipcare<br />
                Everyday Care. A Touch of Luxury.
              </div>

            </div>
          </body>
        </html>
      `,
    });

  if (error) {
    console.error(
      "Cancellation email error:",
      error
    );

    throw new Error(
      "Failed to send cancellation email"
    );
  }

  console.log(
    `Cancellation email sent for order ${order._id}`
  );

  return data;
};