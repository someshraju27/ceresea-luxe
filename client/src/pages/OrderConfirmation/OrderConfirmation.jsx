import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./OrderConfirmation.css";

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated } =
    useAuth();

  const [order, setOrder] =
    useState(
      location.state?.order || null
    );

  const [isLoading, setIsLoading] =
    useState(
      !location.state?.order
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    // If the order already came through
    // React Router state, nothing else is needed.
    if (location.state?.order) {
      setOrder(location.state.order);
      setIsLoading(false);
      return;
    }

    const fetchCompletedOrder =
      async () => {
        try {
          const lastOrderId =
            localStorage.getItem(
              "ceresea-last-order-id"
            );

          // No previously completed order
          // is available.
          if (!lastOrderId) {
            setIsLoading(false);
            return;
          }

          const token =
            localStorage.getItem(
              "ceresea-token"
            );

          if (!token || !isAuthenticated) {
            setIsLoading(false);
            return;
          }

          const response =
            await fetch(
              "/api/orders/my-orders",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to load order"
            );
          }

          const completedOrder =
            (data.orders || []).find(
              (item) =>
                item._id === lastOrderId
            );

          if (!completedOrder) {
            setError(
              "We couldn't load your order details."
            );
            setIsLoading(false);
            return;
          }

          // Only show the confirmation
          // for a successfully paid order.
          if (
            completedOrder.paymentStatus !==
            "paid"
          ) {
            setError(
              "This order has not been confirmed yet."
            );
            setIsLoading(false);
            return;
          }

          setOrder({
            id: completedOrder._id,
            paymentStatus:
              completedOrder.paymentStatus,
            orderStatus:
              completedOrder.orderStatus,
          });

          setIsLoading(false);
        } catch (fetchError) {
          console.error(
            "Order confirmation recovery error:",
            fetchError
          );

          setError(
            "We couldn't load your order details."
          );

          setIsLoading(false);
        }
      };

    fetchCompletedOrder();
  }, [
    location.state,
    isAuthenticated,
  ]);

  /* =======================================================
     Loading
  ======================================================= */

  if (isLoading) {
    return (
      <main className="order-confirmation">
        <div className="order-confirmation__container">
          <p className="order-confirmation__eyebrow">
            ORDER CONFIRMATION
          </p>

          <h1 className="order-confirmation__title">
            Loading your order...
          </h1>

          <p className="order-confirmation__message">
            Please wait while we retrieve
            your order details.
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     No order found
  ======================================================= */

  if (!order) {
    return (
      <main className="order-confirmation">
        <div className="order-confirmation__container">

          <p className="order-confirmation__eyebrow">
            ORDER CONFIRMATION
          </p>

          <h1 className="order-confirmation__title">
            Order details unavailable.
          </h1>

          <p className="order-confirmation__message">
            We couldn't find the order
            details for this confirmation.
            Please check your orders in
            your account.
          </p>

          {error && (
            <p className="order-confirmation__message">
              {error}
            </p>
          )}

          <div className="order-confirmation__actions">

            <Link
              to="/account"
              className="order-confirmation__primary"
            >
              View My Orders
            </Link>

            <Link
              to="/product"
              className="order-confirmation__secondary"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      </main>
    );
  }

  /* =======================================================
     Confirmed order
  ======================================================= */

  return (
    <main className="order-confirmation">
      <div className="order-confirmation__container">

        <div className="order-confirmation__icon">
          ✓
        </div>

        <p className="order-confirmation__eyebrow">
          ORDER CONFIRMED
        </p>

        <h1 className="order-confirmation__title">
          Thank you for your order.
        </h1>

        <p className="order-confirmation__message">
          Your Ceresea order has been
          confirmed and your payment was
          successful.
        </p>

        <div className="order-confirmation__summary">

          <div>
            <span>
              Order ID
            </span>

            <strong>
              #{order.id}
            </strong>
          </div>

          <div>
            <span>
              Payment
            </span>

            <strong>
              Paid
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              Confirmed
            </strong>
          </div>

        </div>

        <div className="order-confirmation__actions">

          <Link
            to="/account"
            className="order-confirmation__primary"
          >
            View My Orders
          </Link>

          <Link
            to="/product"
            className="order-confirmation__secondary"
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    </main>
  );
}

export default OrderConfirmation;