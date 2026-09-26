import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminOrderDetails.css";

const statuses = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrderDetails() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [refunding, setRefunding] =
    useState(false);

  const [
    savingDeliveryDate,
    setSavingDeliveryDate,
  ] = useState(false);

  const [
    expectedDeliveryFrom,
    setExpectedDeliveryFrom,
  ] = useState("");

  const [
    expectedDeliveryTo,
    setExpectedDeliveryTo,
  ] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch order"
          );
        }

        setOrder(data.order);

        setExpectedDeliveryFrom(
          formatDateForInput(
            data.order
              .expectedDeliveryFrom
          )
        );

        setExpectedDeliveryTo(
          formatDateForInput(
            data.order
              .expectedDeliveryTo
          )
        );
      } catch (error) {
        console.error(
          "Admin order details error:",
          error
        );

        setError(
          error.message ||
            "Failed to load order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && orderId) {
      fetchOrder();
    }
  }, [token, orderId]);

  const updateStatus = async (status) => {
    try {
      setUpdatingStatus(true);

      const response = await fetch(
        `/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update order status"
        );
      }

      setOrder(data.order);
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      alert(
        error.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateDeliveryDate = async () => {
    if (
      !expectedDeliveryFrom ||
      !expectedDeliveryTo
    ) {
      alert(
        "Please select both delivery dates."
      );
      return;
    }

    if (
      new Date(expectedDeliveryFrom) >
      new Date(expectedDeliveryTo)
    ) {
      alert(
        "Expected delivery start date cannot be after the end date."
      );
      return;
    }

    try {
      setSavingDeliveryDate(true);

      const response = await fetch(
        `/api/admin/orders/${orderId}/delivery-date`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            expectedDeliveryFrom,
            expectedDeliveryTo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update delivery date"
        );
      }

      setOrder(data.order);

      setExpectedDeliveryFrom(
        formatDateForInput(
          data.order
            .expectedDeliveryFrom
        )
      );

      setExpectedDeliveryTo(
        formatDateForInput(
          data.order
            .expectedDeliveryTo
        )
      );

      alert(
        "Expected delivery date updated successfully."
      );
    } catch (error) {
      console.error(
        "Update delivery date error:",
        error
      );

      alert(
        error.message ||
          "Failed to update delivery date"
      );
    } finally {
      setSavingDeliveryDate(false);
    }
  };

  const refundOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to refund this order? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setRefunding(true);

      const response = await fetch(
        `/api/admin/orders/${orderId}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to process refund"
        );
      }

      setOrder(data.order);

      alert(
        "Refund processed successfully."
      );
    } catch (error) {
      console.error(
        "Refund error:",
        error
      );

      alert(
        error.message ||
          "Failed to process refund"
      );
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details__message">
          Loading order...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details__message admin-order-details__message--error">
          {error}
        </div>

        <Link
          to="/admin/orders"
          className="admin-order-details__back-button"
        >
          ← Back to Orders
        </Link>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const isFailedPayment =
    order.paymentStatus === "failed";

  const displayStatus = isFailedPayment
    ? "failed"
    : order.orderStatus;

  const canRefund =
    order.orderStatus === "cancelled" &&
    order.paymentStatus === "paid" &&
    order.refundStatus !== "processed" &&
    order.paymentStatus !== "refunded";

  const statusLocked =
    isFailedPayment ||
    order.orderStatus === "delivered" ||
    order.orderStatus === "cancelled";

  const deliveryDateLocked =
    order.orderStatus === "delivered" ||
    order.orderStatus === "cancelled";

  const formattedDate = new Date(
    order.createdAt
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(
    order.createdAt
  ).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main className="admin-order-details-page">
      <div className="admin-order-details__container">
        {/* Header */}
        <header className="admin-order-details__header">
          <div>
            <Link
              to="/admin/orders"
              className="admin-order-details__back"
            >
              ← Back to Orders
            </Link>

            <p className="admin-page__eyebrow">
              CERESEA ADMIN
            </p>

            <div className="admin-order-details__title-row">
              <h1>
                Order #
                {order._id
                  .slice(-8)
                  .toUpperCase()}
              </h1>

              <span
                className={`admin-order-details__status admin-order-details__status--${displayStatus}`}
              >
                {displayStatus}
              </span>
            </div>

            <p>
              Placed on {formattedDate} at{" "}
              {formattedTime}
            </p>
          </div>
        </header>

        {/* Main grid */}
        <div className="admin-order-details__grid">
          {/* Customer */}
          <section className="admin-details-card">
            <div className="admin-details-card__heading">
              <span>CUSTOMER</span>
              <h2>
                Customer Information
              </h2>
            </div>

            <div className="admin-details-list">
              <div>
                <span>Name</span>

                <strong>
                  {order.contact.fullName}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {order.contact.email}
                </strong>
              </div>

              <div>
                <span>Phone</span>

                <strong>
                  {order.contact.phone}
                </strong>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="admin-details-card">
            <div className="admin-details-card__heading">
              <span>DELIVERY</span>

              <h2>Shipping Address</h2>
            </div>

            <address className="admin-order-address">
              {
                order.shippingAddress
                  .doorNumber
              }
              <br />

              {
                order.shippingAddress
                  .street
              }

              {order.shippingAddress
                .landmark && (
                <>
                  <br />
                  {
                    order.shippingAddress
                      .landmark
                  }
                </>
              )}

              <br />

              {
                order.shippingAddress.city
              }
              ,{" "}
              {
                order.shippingAddress.state
              }

              <br />

              {
                order.shippingAddress.pincode
              }
            </address>
          </section>

          {/* Expected Delivery */}
          <section className="admin-details-card admin-details-card--full">
            <div className="admin-details-card__heading">
              <span>DELIVERY</span>

              <h2>
                Expected Delivery
              </h2>
            </div>

            <div className="admin-delivery-management">
              <div className="admin-delivery-management__fields">
                <div>
                  <label htmlFor="expected-delivery-from">
                    From
                  </label>

                  <input
                    id="expected-delivery-from"
                    type="date"
                    value={
                      expectedDeliveryFrom
                    }
                    disabled={
                      deliveryDateLocked ||
                      savingDeliveryDate
                    }
                    onChange={(event) =>
                      setExpectedDeliveryFrom(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label htmlFor="expected-delivery-to">
                    To
                  </label>

                  <input
                    id="expected-delivery-to"
                    type="date"
                    value={
                      expectedDeliveryTo
                    }
                    disabled={
                      deliveryDateLocked ||
                      savingDeliveryDate
                    }
                    onChange={(event) =>
                      setExpectedDeliveryTo(
                        event.target.value
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    updateDeliveryDate
                  }
                  disabled={
                    deliveryDateLocked ||
                    savingDeliveryDate
                  }
                >
                  {savingDeliveryDate
                    ? "Saving..."
                    : "Save Delivery Date"}
                </button>
              </div>

              {order.expectedDeliveryFrom &&
                order.expectedDeliveryTo && (
                <p className="admin-delivery-management__current">
                  Current expected delivery:{" "}
                  <strong>
                    {formatDisplayDate(
                      order.expectedDeliveryFrom
                    )}{" "}
                    —{" "}
                    {formatDisplayDate(
                      order.expectedDeliveryTo
                    )}
                  </strong>
                </p>
              )}

              {deliveryDateLocked && (
                <p className="admin-status-note">
                  Delivery dates cannot be
                  changed after the order is{" "}
                  {order.orderStatus}.
                </p>
              )}
            </div>
          </section>

          {/* Items */}
          <section className="admin-details-card admin-details-card--full">
            <div className="admin-details-card__heading">
              <span>ORDER</span>

              <h2>Items</h2>
            </div>

            <div className="admin-order-items">
              {order.items.map((item) => (
                <div
                  key={`${order._id}-${item.shadeId}`}
                  className="admin-order-item"
                >
                  <img
                    src={item.image}
                    alt={item.shadeName}
                  />

                  <div className="admin-order-item__info">
                    <strong>
                      {item.productName}
                    </strong>

                    <span>
                      {item.shadeName}
                    </span>

                    <span>
                      Quantity:{" "}
                      {item.quantity}
                    </span>
                  </div>

                  <div className="admin-order-item__price">
                    <span>
                      ₹{item.price} ×{" "}
                      {item.quantity}
                    </span>

                    <strong>
                      ₹
                      {item.price *
                        item.quantity}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-order-total">
              <span>Order Total</span>

              <strong>
                ₹{order.totalAmount}
              </strong>
            </div>
          </section>

          {/* Payment */}
          <section className="admin-details-card">
            <div className="admin-details-card__heading">
              <span>PAYMENT</span>

              <h2>
                Payment Information
              </h2>
            </div>

            <div className="admin-details-list">
              <div>
                <span>
                  Payment Status
                </span>

                <strong
                  className={`admin-payment-status admin-payment-status--${order.paymentStatus}`}
                >
                  {order.paymentStatus}
                </strong>
              </div>

              <div>
                <span>
                  Razorpay Order ID
                </span>

                <strong className="admin-details-code">
                  {order.razorpayOrderId ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Razorpay Payment ID
                </span>

                <strong className="admin-details-code">
                  {order.razorpayPaymentId ||
                    "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* Refund */}
          <section className="admin-details-card">
            <div className="admin-details-card__heading">
              <span>REFUND</span>

              <h2>
                Refund Information
              </h2>
            </div>

            <div className="admin-details-list">
              <div>
                <span>
                  Refund Status
                </span>

                <strong>
                  {order.refundStatus ||
                    "not_requested"}
                </strong>
              </div>

              <div>
                <span>
                  Razorpay Refund ID
                </span>

                <strong className="admin-details-code">
                  {order.razorpayRefundId ||
                    "—"}
                </strong>
              </div>
            </div>

            {canRefund && (
              <button
                type="button"
                className="admin-order-details__refund"
                onClick={refundOrder}
                disabled={refunding}
              >
                {refunding
                  ? "Processing Refund..."
                  : `Refund ₹${order.totalAmount}`}
              </button>
            )}

            {order.paymentStatus ===
              "refunded" && (
              <div className="admin-order-details__refunded">
                ✓ Refund completed
              </div>
            )}
          </section>

          {/* Status Management */}
          <section className="admin-details-card admin-details-card--full">
            <div className="admin-details-card__heading">
              <span>MANAGEMENT</span>

              <h2>Order Status</h2>
            </div>

            <div className="admin-status-management">
              <div>
                <label htmlFor="admin-order-status">
                  Current Status
                </label>

                {isFailedPayment ? (
                  <div className="admin-order-details__failed-status">
                    Failed
                  </div>
                ) : (
                  <select
                    id="admin-order-status"
                    value={
                      order.orderStatus
                    }
                    disabled={
                      updatingStatus ||
                      statusLocked
                    }
                    onChange={(event) =>
                      updateStatus(
                        event.target.value
                      )
                    }
                  >
                    {statuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status
                            .charAt(0)
                            .toUpperCase() +
                            status.slice(1)}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>

              {updatingStatus && (
                <span className="admin-status-saving">
                  Saving...
                </span>
              )}

              {isFailedPayment && (
                <p className="admin-status-note">
                  Payment failed. This order
                  cannot be progressed or
                  cancelled.
                </p>
              )}

              {!isFailedPayment &&
                order.orderStatus ===
                  "delivered" && (
                  <p className="admin-status-note">
                    Delivered orders cannot
                    be changed.
                  </p>
                )}

              {!isFailedPayment &&
                order.orderStatus ===
                  "cancelled" && (
                  <p className="admin-status-note">
                    Cancelled orders cannot
                    be changed.
                  </p>
                )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function formatDateForInput(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year =
    parsedDate.getFullYear();

  const month = String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsedDate.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default AdminOrderDetails;