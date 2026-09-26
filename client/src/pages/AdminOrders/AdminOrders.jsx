import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminOrders.css";

const statuses = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [refundingOrder, setRefundingOrder] = useState(null);
  const [savingDeliveryDate, setSavingDeliveryDate] =
    useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [refundFilter, setRefundFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch orders"
          );
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error(
          "Admin orders error:",
          error
        );

        setError(
          error.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingOrder(orderId);

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
            "Failed to update status"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      );
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      alert(
        error.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updateDeliveryDate = async (
    orderId,
    expectedDeliveryFrom,
    expectedDeliveryTo
  ) => {
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
      setSavingDeliveryDate(orderId);

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

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
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
      setSavingDeliveryDate(null);
    }
  };

  const refundOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to refund this order? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setRefundingOrder(orderId);

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

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      );

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
      setRefundingOrder(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(
    (order) => {
      const search =
        searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        String(order._id)
          .toLowerCase()
          .includes(search) ||
        order.contact.fullName
          .toLowerCase()
          .includes(search) ||
        order.contact.email
          .toLowerCase()
          .includes(search) ||
        order.contact.phone.includes(search);

      const displayStatus =
        order.paymentStatus === "failed"
          ? "failed"
          : order.orderStatus;

      const matchesStatus =
        statusFilter === "all" ||
        displayStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentStatus ===
          paymentFilter;

      const matchesRefund =
        refundFilter === "all" ||
        order.refundStatus ===
          refundFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesRefund
      );
    }
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setRefundFilter("all");
  };

  const formatDateForInput = (date) => {
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
  };

  const formatDeliveryDate = (date) => {
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
  };

  if (loading) {
    return (
      <main className="admin-orders-page">
        <div className="admin-orders-page__message">
          Loading orders...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-orders-page">
        <div className="admin-orders-page__message admin-orders-page__message--error">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-page__container">
        <header className="admin-orders-page__header">
          <div>
            <Link
              to="/admin"
              className="admin-orders-page__back"
            >
              ← Dashboard
            </Link>

            <p className="admin-page__eyebrow">
              CERESEA ADMIN
            </p>

            <h1>Orders</h1>

            <p>
              Manage customer orders and
              delivery status.
            </p>
          </div>

          <span className="admin-orders-page__count">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1
              ? "order"
              : "orders"}
          </span>
        </header>

        {/* Filters */}
        {orders.length > 0 && (
          <section className="admin-orders-filters">
            <div className="admin-orders-filter-search">
              <input
                type="text"
                placeholder="Search order, customer, email or phone..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="admin-orders-filter-group">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Order Statuses
                </option>

                <option value="failed">
                  Failed
                </option>

                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status
                      .charAt(0)
                      .toUpperCase() +
                      status.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Payment Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="failed">
                  Failed
                </option>

                <option value="refunded">
                  Refunded
                </option>
              </select>

              <select
                value={refundFilter}
                onChange={(event) =>
                  setRefundFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Refund Statuses
                </option>

                <option value="not_requested">
                  Not Requested
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="processed">
                  Processed
                </option>

                <option value="failed">
                  Failed
                </option>
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="admin-orders-filter-clear"
              >
                Clear Filters
              </button>
            </div>
          </section>
        )}

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="admin-orders-page__empty">
            {orders.length === 0
              ? "No orders found."
              : "No orders match your filters."}
          </div>
        ) : (
          <div className="admin-orders-list">
            {filteredOrders.map((order) => {
              const isFailedPayment =
                order.paymentStatus ===
                "failed";

              const displayStatus =
                isFailedPayment
                  ? "failed"
                  : order.orderStatus;

              const canRefund =
                order.orderStatus ===
                  "cancelled" &&
                order.paymentStatus ===
                  "paid" &&
                order.refundStatus !==
                  "processed" &&
                order.paymentStatus !==
                  "refunded";

              const deliveryDateLocked =
                order.orderStatus ===
                  "delivered" ||
                order.orderStatus ===
                  "cancelled";

              return (
                <article
                  key={order._id}
                  className="admin-order-card"
                >
                  <div className="admin-order-card__header">
                    <div>
                      <span>ORDER</span>

                      <strong>
                        #
                        {order._id
                          .slice(-8)
                          .toUpperCase()}
                      </strong>
                    </div>

                    <div>
                      <span>DATE</span>

                      <strong>
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>CUSTOMER</span>

                      <strong>
                        {order.contact.fullName}
                      </strong>
                    </div>

                    <div>
                      <span>TOTAL</span>

                      <strong>
                        ₹{order.totalAmount}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-order-card__body">
                    <div className="admin-order-card__customer">
                      <span>Email</span>

                      <strong>
                        {order.contact.email}
                      </strong>

                      <span>Phone</span>

                      <strong>
                        {order.contact.phone}
                      </strong>
                    </div>

                    <div className="admin-order-card__items">
                      {order.items.map(
                        (item) => (
                          <div
                            key={`${order._id}-${item.shadeId}`}
                            className="admin-order-card__item"
                          >
                            <img
                              src={item.image}
                              alt={
                                item.shadeName
                              }
                            />

                            <div>
                              <strong>
                                {
                                  item.productName
                                }
                              </strong>

                              <span>
                                {
                                  item.shadeName
                                }{" "}
                                · Qty{" "}
                                {
                                  item.quantity
                                }
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="admin-order-card__address">
                      <span>
                        SHIPPING ADDRESS
                      </span>

                      <p>
                        {
                          order
                            .shippingAddress
                            .doorNumber
                        }
                        <br />

                        {
                          order
                            .shippingAddress
                            .street
                        }

                        {order.shippingAddress
                          .landmark && (
                          <>
                            <br />
                            {
                              order
                                .shippingAddress
                                .landmark
                            }
                          </>
                        )}

                        <br />

                        {
                          order
                            .shippingAddress
                            .city
                        }
                        ,{" "}
                        {
                          order
                            .shippingAddress
                            .state
                        }

                        <br />

                        {
                          order
                            .shippingAddress
                            .pincode
                        }
                      </p>
                    </div>
                  </div>

                  {/* Expected Delivery */}
                  <div className="admin-order-card__delivery">
                    <div>
                      <span>
                        EXPECTED DELIVERY
                      </span>

                      {order.expectedDeliveryFrom &&
                      order.expectedDeliveryTo ? (
                        <p>
                          {formatDeliveryDate(
                            order.expectedDeliveryFrom
                          )}{" "}
                          —{" "}
                          {formatDeliveryDate(
                            order.expectedDeliveryTo
                          )}
                        </p>
                      ) : (
                        <p>
                          Delivery date not
                          set
                        </p>
                      )}
                    </div>

                    <div className="admin-order-card__delivery-fields">
                      <div>
                        <label
                          htmlFor={`delivery-from-${order._id}`}
                        >
                          From
                        </label>

                        <input
                          id={`delivery-from-${order._id}`}
                          type="date"
                          defaultValue={formatDateForInput(
                            order.expectedDeliveryFrom
                          )}
                          disabled={
                            deliveryDateLocked ||
                            savingDeliveryDate ===
                              order._id
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`delivery-to-${order._id}`}
                        >
                          To
                        </label>

                        <input
                          id={`delivery-to-${order._id}`}
                          type="date"
                          defaultValue={formatDateForInput(
                            order.expectedDeliveryTo
                          )}
                          disabled={
                            deliveryDateLocked ||
                            savingDeliveryDate ===
                              order._id
                          }
                        />
                      </div>

                      <button
                        type="button"
                        disabled={
                          deliveryDateLocked ||
                          savingDeliveryDate ===
                            order._id
                        }
                        onClick={() => {
                          const fromInput =
                            document.getElementById(
                              `delivery-from-${order._id}`
                            );

                          const toInput =
                            document.getElementById(
                              `delivery-to-${order._id}`
                            );

                          updateDeliveryDate(
                            order._id,
                            fromInput?.value,
                            toInput?.value
                          );
                        }}
                      >
                        {savingDeliveryDate ===
                        order._id
                          ? "Saving..."
                          : "Save Date"}
                      </button>
                    </div>

                    {deliveryDateLocked && (
                      <small>
                        Delivery dates cannot
                        be changed after the
                        order is{" "}
                        {order.orderStatus}.
                      </small>
                    )}
                  </div>

                  <div className="admin-order-card__footer">
                    <div>
                      <span>PAYMENT</span>

                      <strong>
                        {order.paymentStatus}
                      </strong>

                      {order.refundStatus &&
                        order.refundStatus !==
                          "not_requested" && (
                          <>
                            <span>
                              REFUND
                            </span>

                            <strong>
                              {
                                order.refundStatus
                              }
                            </strong>
                          </>
                        )}
                    </div>

                    <div className="admin-order-card__status">
                      <label
                        htmlFor={`status-${order._id}`}
                      >
                        ORDER STATUS
                      </label>

                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="admin-order-card__details"
                      >
                        View Details
                      </Link>

                      {isFailedPayment ? (
                        <div className="admin-order-card__failed-status">
                          Failed
                        </div>
                      ) : (
                        <select
                          id={`status-${order._id}`}
                          value={displayStatus}
                          disabled={
                            updatingOrder ===
                              order._id ||
                            refundingOrder ===
                              order._id ||
                            order.orderStatus ===
                              "delivered" ||
                            order.orderStatus ===
                              "cancelled"
                          }
                          onChange={(event) =>
                            updateStatus(
                              order._id,
                              event.target
                                .value
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
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase() +
                                  status.slice(
                                    1
                                  )}
                              </option>
                            )
                          )}
                        </select>
                      )}

                      {updatingOrder ===
                        order._id && (
                        <span className="admin-order-card__saving">
                          Saving...
                        </span>
                      )}

                      {isFailedPayment && (
                        <span className="admin-order-card__status-note">
                          Payment failed. Order
                          status cannot be
                          changed.
                        </span>
                      )}

                      {canRefund && (
                        <button
                          type="button"
                          onClick={() =>
                            refundOrder(
                              order._id
                            )
                          }
                          disabled={
                            refundingOrder ===
                            order._id
                          }
                          className="admin-order-card__refund"
                        >
                          {refundingOrder ===
                          order._id
                            ? "Processing Refund..."
                            : `Refund ₹${order.totalAmount}`}
                        </button>
                      )}

                      {order.paymentStatus ===
                        "refunded" && (
                        <span className="admin-order-card__refunded">
                          Refunded
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminOrders;