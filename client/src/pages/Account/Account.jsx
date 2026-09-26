import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { verifyPincode } from "../../utils/pincode";
import "./Account.css";

function Account() {
  const {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [phoneError, setPhoneError] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);

  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      setPhoneNumber(value);
    }

    setPhoneError("");
  };

  const savePhoneNumber = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    if (!cleanPhone) {
      setPhoneError("Phone number is required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setPhoneError(
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setPhoneSaving(true);
      setPhoneError("");

      const response = await fetch(
        "/api/auth/phone",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: cleanPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update phone number"
        );
      }

      login(data.user, token);

      setPhoneNumber(data.phone);
      setShowPhoneForm(false);
    } catch (error) {
      console.error(
        "Update phone error:",
        error
      );

      setPhoneError(
        error.message ||
          "Failed to update phone number"
      );
    } finally {
      setPhoneSaving(false);
    }
  };

  // Saved addresses
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] =
    useState(false);
  const [addressSaving, setAddressSaving] =
    useState(false);
  const [addressDeleting, setAddressDeleting] =
    useState(null);
  const [addressError, setAddressError] = useState("");
  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [addressForm, setAddressForm] = useState({
    doorNumber: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [pincodeChecking, setPincodeChecking] =
    useState(false);
  const [pincodeVerified, setPincodeVerified] =
    useState(false);
  const [pincodeMessage, setPincodeMessage] =
    useState("");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) {
        return;
      }

      try {
        setOrdersLoading(true);
        setOrdersError("");

        const response = await fetch(
          "/api/orders/my-orders",
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
          "Fetch orders error:",
          error
        );

        setOrdersError(
          error.message ||
            "Failed to load your orders"
        );
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token]);

  // ==========================================
  // FETCH SAVED ADDRESSES
  // ==========================================

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated || !token) {
        return;
      }

      try {
        setAddressesLoading(true);
        setAddressError("");

        const response = await fetch(
          "/api/auth/addresses",
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
              "Failed to fetch saved addresses"
          );
        }

        setAddresses(data.addresses || []);
      } catch (error) {
        console.error(
          "Fetch addresses error:",
          error
        );

        setAddressError(
          error.message ||
            "Failed to load saved addresses"
        );
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, token]);

  // ==========================================
  // ORDER HELPERS
  // ==========================================

  const toggleOrder = (orderId) => {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId
    );
  };

  const getStatusStep = (status) => {
    const steps = [
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];

    return steps.indexOf(status);
  };

  const formatDeliveryDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const canCancelOrder = (order) => {
    if (order.paymentStatus === "failed") {
      return false;
    }

    return [
      "pending",
      "confirmed",
      "processing",
    ].includes(order.orderStatus);
  };

  // ==========================================
  // CANCEL ORDER
  // ==========================================

  const handleCancelOrder = async (order) => {
    const isPaid = order.paymentStatus === "paid";

    const confirmationMessage = isPaid
      ? "Are you sure you want to cancel this order? Your payment will be refunded through Razorpay."
      : "Are you sure you want to cancel this order?";

    const confirmed = window.confirm(
      confirmationMessage
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrder(order._id);
      setOrdersError("");

      const response = await fetch(
        `/api/orders/${order._id}/cancel`,
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
          data.message || "Failed to cancel order"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? data.order
            : currentOrder
        )
      );
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      setOrdersError(
        error.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancellingOrder(null);
    }
  };

  // ==========================================
  // ADDRESS HELPERS
  // ==========================================

  const handleAddressChange = async (e) => {
    const { name, value } = e.target;

    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "pincode") {
      setPincodeVerified(false);
      setPincodeMessage("");

      if (
        value.length === 6 &&
        /^\d{6}$/.test(value)
      ) {
        setPincodeChecking(true);

        const result = await verifyPincode(value);

        setPincodeChecking(false);

        if (result.valid) {
          setPincodeVerified(true);
          setPincodeMessage(result.message);

          setAddressForm((prev) => ({
            ...prev,
            city: result.city,
            state: result.state,
          }));
        } else {
          setPincodeVerified(false);
          setPincodeMessage(result.message);

          setAddressForm((prev) => ({
            ...prev,
            city: "",
            state: "",
          }));
        }
      }
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      doorNumber: "",
      street: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const saveAddress = async (event) => {
    event.preventDefault();

    setAddressError("");

    const {
      doorNumber,
      street,
      landmark,
      city,
      state,
      pincode,
    } = addressForm;

    if (
      !doorNumber.trim() ||
      !street.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      setAddressError(
        "Please fill in all required address fields."
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setAddressError(
        "Pincode must be exactly 6 digits."
      );
      return;
    }

    try {
      setAddressSaving(true);

      const response = await fetch(
        "/api/auth/addresses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doorNumber: doorNumber.trim(),
            street: street.trim(),
            landmark: landmark.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save address"
        );
      }

      setAddresses(data.addresses || []);

      resetAddressForm();
      setShowAddressForm(false);
    } catch (error) {
      console.error(
        "Save address error:",
        error
      );

      setAddressError(
        error.message ||
          "Failed to save address"
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this saved address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setAddressDeleting(addressId);
      setAddressError("");

      const response = await fetch(
        `/api/auth/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete address"
        );
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      console.error(
        "Delete address error:",
        error
      );

      setAddressError(
        error.message ||
          "Failed to delete address"
      );
    } finally {
      setAddressDeleting(null);
    }
  };

  // ==========================================
  // GUEST
  // ==========================================

  if (!isAuthenticated) {
    return (
      <main className="account-page">
        <div className="account-page__guest">
          <p className="account-page__eyebrow">
            YOUR ACCOUNT
          </p>

          <h1>
            Welcome to
            <span>Ceresea.</span>
          </h1>

          <p className="account-page__description">
            Sign in to manage your account, view your
            orders, and enjoy a seamless Ceresea
            experience.
          </p>

          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const response = await fetch(
                  "/api/auth/google",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({
                      credential:
                        credentialResponse.credential,
                    }),
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.message ||
                      "Google login failed"
                  );
                }

                login(data.user, data.token);
              } catch (error) {
                console.error(
                  "Login error:",
                  error
                );
              }
            }}
            onError={() => {
              console.error(
                "Google login failed"
              );
            }}
            useOneTap={false}
          />

          <p className="account-page__note">
            Secure sign-in powered by Google
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-page__container">
        {/* Account Header */}
        <header className="account-page__header">
          <div>
            <p className="account-page__eyebrow">
              YOUR ACCOUNT
            </p>

            <h1>
              Welcome back,
              <span>{user.name}</span>
            </h1>
          </div>
        </header>

        <div className="account-page__layout">
          {/* Profile */}
          <section className="account-page__profile">
            <div className="account-profile__top">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="account-profile__image"
              />

              <div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="account-profile__details">
              <div>
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="account-profile__phone">
                <span>Phone</span>

                {!showPhoneForm ? (
                  <div className="account-profile__phone-display">
                    <strong>
                      {user.phone ||
                        "Not added yet"}
                    </strong>

                    <button
                      type="button"
                      onClick={() => {
                        setPhoneNumber(
                          user.phone || ""
                        );
                        setPhoneError("");
                        setShowPhoneForm(true);
                      }}
                    >
                      {user.phone
                        ? "Change"
                        : "Add phone"}
                    </button>
                  </div>
                ) : (
                  <div className="account-profile__phone-form">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={
                        handlePhoneChange
                      }
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                    />

                    {phoneError && (
                      <small>
                        {phoneError}
                      </small>
                    )}

                    <div className="account-profile__phone-actions">
                      <button
                        type="button"
                        onClick={
                          savePhoneNumber
                        }
                        disabled={
                          phoneSaving
                        }
                      >
                        {phoneSaving
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPhoneForm(
                            false
                          );
                          setPhoneError("");
                        }}
                        disabled={
                          phoneSaving
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Account Actions */}
          <section className="account-page__actions">
            <Link
              to="/bag"
              className="account-action"
            >
              <div>
                <span>01</span>
                <h2>Your Bag</h2>
                <p>
                  View your selected Ceresea shades.
                </p>
              </div>

              <span>→</span>
            </Link>

            <a
              href="#orders"
              className="account-action"
            >
              <div>
                <span>02</span>
                <h2>Your Orders</h2>
                <p>
                  View your previous Ceresea orders.
                </p>
              </div>

              <span>→</span>
            </a>

            <a
              href="#saved-addresses"
              className="account-action"
            >
              <div>
                <span>03</span>
                <h2>Saved Addresses</h2>
                <p>
                  Save your delivery address for
                  faster checkout.
                </p>
              </div>

              <span>→</span>
            </a>
          </section>
        </div>

        {/* =====================================
            SAVED ADDRESSES
        ===================================== */}

        <section
          id="saved-addresses"
          className="account-addresses"
        >
          <div className="account-addresses__header">
            <div>
              <p className="account-addresses__eyebrow">
                DELIVERY
              </p>

              <h2>Saved Addresses</h2>

              <p>
                Save your frequently used addresses
                for a faster checkout.
              </p>
            </div>

            <button
              type="button"
              className="account-addresses__add"
              onClick={() => {
                setAddressError("");
                setShowAddressForm(
                  (current) => !current
                );
              }}
            >
              {showAddressForm
                ? "Cancel"
                : "+ Add Address"}
            </button>
          </div>

          {addressError && (
            <div className="account-addresses__error">
              {addressError}
            </div>
          )}

          {showAddressForm && (
            <form
              className="account-address-form"
              onSubmit={saveAddress}
            >
              <div className="account-address-form__grid">
                <div className="account-address-form__field">
                  <label htmlFor="doorNumber">
                    Door / House Number
                  </label>

                  <input
                    id="doorNumber"
                    name="doorNumber"
                    type="text"
                    value={addressForm.doorNumber}
                    onChange={handleAddressChange}
                    placeholder="12-34"
                  />
                </div>

                <div className="account-address-form__field">
                  <label htmlFor="street">
                    Street / Area
                  </label>

                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={addressForm.street}
                    onChange={handleAddressChange}
                    placeholder="MG Road"
                  />
                </div>

                <div className="account-address-form__field account-address-form__field--full">
                  <label htmlFor="landmark">
                    Landmark{" "}
                    <span>(Optional)</span>
                  </label>

                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    value={addressForm.landmark}
                    onChange={handleAddressChange}
                    placeholder="Near Central Mall"
                  />
                </div>

                <div className="account-address-form__field">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    placeholder="Hyderabad"
                  />
                </div>

                <div className="account-address-form__field">
                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={addressForm.state}
                    onChange={handleAddressChange}
                    placeholder="Telangana"
                  />
                </div>

                <div className="account-address-form__field">
                  <label htmlFor="pincode">
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={handleAddressChange}
                    placeholder="500001"
                  />

                  <div
                    className={`account-address-form__pincode-message ${
                      pincodeChecking
                        ? "account-address-form__pincode-message--checking"
                        : pincodeVerified
                        ? "account-address-form__pincode-message--success"
                        : pincodeMessage
                        ? "account-address-form__pincode-message--error"
                        : ""
                    }`}
                  >
                    {pincodeChecking
                      ? "Checking pincode..."
                      : pincodeMessage}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="account-address-form__submit"
                disabled={addressSaving}
              >
                {addressSaving
                  ? "Saving Address..."
                  : "Save Address"}
              </button>
            </form>
          )}

          {addressesLoading && (
            <div className="account-addresses__message">
              Loading saved addresses...
            </div>
          )}

          {!addressesLoading &&
            addresses.length === 0 &&
            !showAddressForm && (
              <div className="account-addresses__empty">
                <p>
                  You haven't saved any addresses yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddressForm(true)
                  }
                >
                  Add your first address →
                </button>
              </div>
            )}

          {!addressesLoading &&
            addresses.length > 0 && (
              <div className="account-addresses__list">
                {addresses.map((address) => (
                  <article
                    key={address._id}
                    className="account-address-card"
                  >
                    <div>
                      <p className="account-address-card__label">
                        DELIVERY ADDRESS
                      </p>

                      <p className="account-address-card__text">
                        {address.doorNumber}
                        <br />

                        {address.street}

                        {address.landmark && (
                          <>
                            <br />
                            <span className="account-address-card__landmark">
                              Near{" "}
                              {address.landmark}
                            </span>
                          </>
                        )}

                        <br />

                        {address.city},{" "}
                        {address.state}
                        <br />

                        {address.pincode}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="account-address-card__delete"
                      onClick={() =>
                        deleteAddress(address._id)
                      }
                      disabled={
                        addressDeleting ===
                        address._id
                      }
                    >
                      {addressDeleting ===
                      address._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </article>
                ))}
              </div>
            )}
        </section>

        {/* =====================================
            ORDER HISTORY
        ===================================== */}

        <section
          id="orders"
          className="account-orders"
        >
          <div className="account-orders__header">
            <div>
              <p className="account-orders__eyebrow">
                YOUR ORDERS
              </p>

              <h2>Order History</h2>
            </div>

            <span>
              {orders.length}{" "}
              {orders.length === 1
                ? "order"
                : "orders"}
            </span>
          </div>

          {ordersLoading && (
            <div className="account-orders__message">
              Loading your orders...
            </div>
          )}

          {ordersError && (
            <div className="account-orders__message account-orders__message--error">
              {ordersError}
            </div>
          )}

          {!ordersLoading &&
            !ordersError &&
            orders.length === 0 && (
              <div className="account-orders__empty">
                <p>
                  You haven't placed any orders yet.
                </p>

                <Link to="/product">
                  Explore Ceresea →
                </Link>
              </div>
            )}

          {!ordersLoading &&
            !ordersError &&
            orders.length > 0 && (
              <div className="account-orders__list">
                {orders.map((order) => {
                  const isExpanded =
                    expandedOrder === order._id;

                  const isCancelled =
                    order.orderStatus ===
                    "cancelled";

                  const isFailedPayment =
                    order.paymentStatus ===
                    "failed";

                  const displayStatus =
                    isFailedPayment
                      ? "failed"
                      : order.orderStatus;

                  const currentStep =
                    getStatusStep(
                      order.orderStatus
                    );

                  return (
                    <article
                      key={order._id}
                      className={`account-order ${
                        isExpanded
                          ? "account-order--expanded"
                          : ""
                      } ${
                        isCancelled
                          ? "account-order--cancelled"
                          : ""
                      } ${
                        isFailedPayment
                          ? "account-order--failed"
                          : ""
                      }`}
                    >
                      {/* Order Header */}
                      <div className="account-order__top">
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
                          <span>TOTAL</span>

                          <strong>
                            ₹{order.totalAmount}
                          </strong>
                        </div>

                        <div>
                          <span>STATUS</span>

                          <strong className="account-order__status">
                            {displayStatus}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="account-order__details-button"
                          onClick={() =>
                            toggleOrder(
                              order._id
                            )
                          }
                          aria-expanded={
                            isExpanded
                          }
                        >
                          {isExpanded
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                      </div>

                      {/* Items */}
                      <div className="account-order__items">
                        {order.items.map(
                          (item) => (
                            <div
                              key={`${order._id}-${item.shadeId}`}
                              className="account-order__item"
                            >
                              <img
                                src={item.image}
                                alt={`${item.productName} ${item.shadeName}`}
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

                              <strong>
                                ₹
                                {item.price *
                                  item.quantity}
                              </strong>
                            </div>
                          )
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="account-order__details">
                          {/* Status */}
                          <div className="account-order__section">
                            <h3>
                              Order Status
                            </h3>

                            {isFailedPayment ? (
                              <div className="account-order__failed-status">
                                <strong>
                                  Payment Failed
                                </strong>

                                <span>
                                  Your payment was
                                  unsuccessful and
                                  this order will not
                                  be processed.
                                </span>
                              </div>
                            ) : isCancelled ? (
                              <div className="account-order__cancelled-status">
                                <strong>
                                  Order Cancelled
                                </strong>

                                <span>
                                  This order has been
                                  cancelled.
                                </span>
                              </div>
                            ) : (
                              <div className="account-order__timeline">
                                {[
                                  {
                                    key: "confirmed",
                                    label:
                                      "Order Confirmed",
                                  },
                                  {
                                    key: "processing",
                                    label:
                                      "Processing",
                                  },
                                  {
                                    key: "shipped",
                                    label:
                                      "Shipped",
                                  },
                                  {
                                    key: "delivered",
                                    label:
                                      "Delivered",
                                  },
                                ].map(
                                  (
                                    step,
                                    index
                                  ) => {
                                    const isCompleted =
                                      index <=
                                      currentStep;

                                    return (
                                      <div
                                        key={
                                          step.key
                                        }
                                        className={`account-order__timeline-step ${
                                          isCompleted
                                            ? "account-order__timeline-step--completed"
                                            : ""
                                        }`}
                                      >
                                        <div className="account-order__timeline-marker">
                                          {isCompleted
                                            ? "✓"
                                            : ""}
                                        </div>

                                        <span>
                                          {
                                            step.label
                                          }
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>

                          {/* Expected Delivery */}
                          <div className="account-order__section account-order__delivery">
                            <h3>
                              Expected Delivery
                            </h3>

                            {isFailedPayment ? (
                              <p className="account-order__delivery-date">
                                —
                              </p>
                            ) : order.expectedDeliveryFrom &&
                              order.expectedDeliveryTo ? (
                              <>
                                <p className="account-order__delivery-date">
                                  {formatDeliveryDate(
                                    order.expectedDeliveryFrom
                                  )}{" "}
                                  —{" "}
                                  {formatDeliveryDate(
                                    order.expectedDeliveryTo
                                  )}
                                </p>

                                {order.orderStatus !==
                                  "delivered" &&
                                  order.orderStatus !==
                                    "cancelled" && (
                                    <span className="account-order__delivery-note">
                                      Your order is
                                      expected to
                                      arrive within
                                      this window.
                                    </span>
                                  )}

                                {order.orderStatus ===
                                  "delivered" && (
                                  <span className="account-order__delivery-note">
                                    Delivered
                                    successfully.
                                  </span>
                                )}

                                {order.orderStatus ===
                                  "cancelled" && (
                                  <span className="account-order__delivery-note">
                                    This order was
                                    cancelled.
                                  </span>
                                )}
                              </>
                            ) : (
                              <p className="account-order__delivery-date">
                                Expected delivery
                                date will be
                                updated soon.
                              </p>
                            )}
                          </div>

                          {/* Shipping Address */}
                          <div className="account-order__section">
                            <h3>
                              Shipping Address
                            </h3>

                            <p className="account-order__address">
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
                                  Near{" "}
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

                          {/* Contact */}
                          <div className="account-order__section">
                            <h3>Contact</h3>

                            <p className="account-order__contact">
                              {
                                order.contact
                                  .fullName
                              }
                              <br />
                              {
                                order.contact.email
                              }
                              <br />
                              {
                                order.contact.phone
                              }
                            </p>
                          </div>

                          {/* Payment */}
                          <div className="account-order__section">
                            <h3>Payment</h3>

                            <div className="account-order__payment">
                              <span>
                                Payment Status
                              </span>

                              <strong>
                                {
                                  order.paymentStatus
                                }
                              </strong>
                            </div>

                            {order.refundStatus &&
                              order.refundStatus !==
                                "not_requested" && (
                                <div className="account-order__payment">
                                  <span>
                                    Refund Status
                                  </span>

                                  <strong>
                                    {
                                      order.refundStatus
                                    }
                                  </strong>
                                </div>
                              )}

                            <div className="account-order__payment">
                              <span>
                                Order Total
                              </span>

                              <strong>
                                ₹
                                {
                                  order.totalAmount
                                }
                              </strong>
                            </div>
                          </div>

                          {/* Cancellation */}
                          {canCancelOrder(order) && (
                            <div className="account-order__cancel-section">
                              <div>
                                <h3>
                                  Cancel Order
                                </h3>

                                <p>
                                  You can cancel this
                                  order before it is
                                  shipped.
                                  {order.paymentStatus ===
                                    "paid" &&
                                    " Your payment will be refunded."}
                                </p>
                              </div>

                              <button
                                type="button"
                                className="account-order__cancel-button"
                                onClick={() =>
                                  handleCancelOrder(
                                    order
                                  )
                                }
                                disabled={
                                  cancellingOrder ===
                                  order._id
                                }
                              >
                                {cancellingOrder ===
                                order._id
                                  ? "Cancelling..."
                                  : "Cancel Order"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="account-order__bottom">
                        <span>
                          Payment:{" "}
                          <strong>
                            {
                              order.paymentStatus
                            }
                          </strong>
                        </span>

                        <span>
                          {
                            order.shippingAddress
                              .city
                          }
                          ,{" "}
                          {
                            order.shippingAddress
                              .state
                          }
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>

        {/* Logout */}
        <button
          type="button"
          className="account-page__logout"
          onClick={logout}
        >
          Log Out
        </button>
      </div>
    </main>
  );
}

export default Account;