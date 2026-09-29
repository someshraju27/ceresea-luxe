import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useCart } from "../../context/cartContext";
import { useAuth } from "../../context/AuthContext";
import "./Checkout.css";

function Checkout() {
  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    login,
  } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    doorNumber: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] =
    useState(false);

  const [paymentVerified, setPaymentVerified] =
    useState(false);

  // ------------------------------------------------
  // Payment recovery state
  // ------------------------------------------------

  const [
    isRecoveringPayment,
    setIsRecoveringPayment,
  ] = useState(false);

  // Keep latest clearCart function available
  // without making recovery effect rerun when
  // the function reference changes.
  const clearCartRef = useRef(clearCart);

  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  // ------------------------------------------------
  // Saved addresses
  // ------------------------------------------------

  const [savedAddresses, setSavedAddresses] =
    useState([]);

  const [
    addressesLoading,
    setAddressesLoading,
  ] = useState(false);

  const [addressError, setAddressError] =
    useState("");

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState("");

  const [
    showNewAddressForm,
    setShowNewAddressForm,
  ] = useState(true);

  // =================================================
  // USER DETAILS
  // =================================================

  useEffect(() => {
    if (user) {
      setFormData((current) => ({
        ...current,

        fullName:
          current.fullName ||
          user.name ||
          "",

        email:
          current.email ||
          user.email ||
          "",

        phone:
          current.phone ||
          user.phone ||
          "",
      }));
    }
  }, [user]);

  // =================================================
  // FETCH SAVED ADDRESSES
  // =================================================

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!isAuthenticated || !user) {
        setSavedAddresses([]);
        return;
      }

      const token =
        localStorage.getItem(
          "ceresea-token"
        );

      if (!token) {
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

        const addresses =
          data.addresses || [];

        setSavedAddresses(addresses);

        // Do NOT automatically select
        // the first address.
        if (addresses.length > 0) {
          setSelectedAddressId("");
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error(
          "Fetch checkout addresses error:",
          error
        );

        setAddressError(
          error.message ||
            "Failed to load saved addresses"
        );

        // Allow entering a new address
        // if saved addresses fail to load.
        setShowNewAddressForm(true);
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchSavedAddresses();
  }, [isAuthenticated, user]);

  // =================================================
  // PAYMENT RECOVERY / RECONCILIATION
  //
  // Handles:
  //
  // Payment successful
  //       ↓
  // Razorpay success screen
  //       ↓
  // User presses F5
  //       ↓
  // Checkout reloads
  //       ↓
  // Check our order
  //       ↓
  // If already paid → confirmation
  //       ↓
  // If still pending → ask Razorpay
  //       ↓
  // If captured → confirm order
  //       ↓
  // If not captured → keep checking
  // =================================================

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const pendingOrderId =
      localStorage.getItem(
        "ceresea-pending-order-id"
      );

    if (!pendingOrderId) {
      return;
    }

    let cancelled = false;
    let timeoutId = null;

    const recoverPayment = async () => {
      setIsRecoveringPayment(true);

      const maxAttempts = 6;
      const delay = 1500;

      for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt += 1
      ) {
        if (cancelled) {
          return;
        }

        try {
          const token =
            localStorage.getItem(
              "ceresea-token"
            );

          if (!token) {
            break;
          }

          // -----------------------------------------
          // STEP 1:
          // Get our current order status
          // -----------------------------------------

          const orderResponse =
            await fetch(
              `/api/orders/${pendingOrderId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const orderData =
            await orderResponse.json();

          if (
            orderResponse.ok &&
            orderData.order
          ) {
            const order =
              orderData.order;

            // -----------------------------------------
            // PAYMENT ALREADY CONFIRMED
            // -----------------------------------------

            if (
              order.paymentStatus ===
                "paid" &&
              order.orderStatus ===
                "confirmed"
            ) {
              localStorage.setItem(
                "ceresea-last-order-id",
                order._id ||
                  order.id
              );

              localStorage.removeItem(
                "ceresea-pending-order-id"
              );

              localStorage.removeItem(
                "ceresea-razorpay-order-id"
              );

              clearCartRef.current();

              if (!cancelled) {
                setIsRecoveringPayment(
                  false
                );

                navigate(
                  "/order-confirmation",
                  {
                    state: {
                      order,
                    },
                    replace: true,
                  }
                );
              }

              return;
            }

            // -----------------------------------------
            // PAYMENT FAILED
            // -----------------------------------------

            if (
              order.paymentStatus ===
              "failed"
            ) {
              localStorage.removeItem(
                "ceresea-pending-order-id"
              );

              localStorage.removeItem(
                "ceresea-razorpay-order-id"
              );

              if (!cancelled) {
                setIsRecoveringPayment(
                  false
                );

                setIsProcessing(false);
              }

              return;
            }

            // -----------------------------------------
            // PAYMENT STILL PENDING
            //
            // Ask Razorpay directly.
            // -----------------------------------------

            if (
              order.paymentStatus ===
              "pending"
            ) {
              try {
                const reconcileResponse =
                  await fetch(
                    `/api/payments/reconcile/${pendingOrderId}`,
                    {
                      method: "POST",

                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                const reconcileData =
                  await reconcileResponse.json();

                if (
                  reconcileResponse.ok &&
                  reconcileData.order
                ) {
                  const reconciledOrder =
                    reconcileData.order;

                  // -------------------------------------
                  // RAZORPAY CONFIRMED PAYMENT
                  // -------------------------------------

                  if (
                    reconciledOrder.paymentStatus ===
                      "paid" &&
                    reconciledOrder.orderStatus ===
                      "confirmed"
                  ) {
                    localStorage.setItem(
                      "ceresea-last-order-id",
                      reconciledOrder._id ||
                        reconciledOrder.id
                    );

                    localStorage.removeItem(
                      "ceresea-pending-order-id"
                    );

                    localStorage.removeItem(
                      "ceresea-razorpay-order-id"
                    );

                    clearCartRef.current();

                    if (!cancelled) {
                      setIsRecoveringPayment(
                        false
                      );

                      navigate(
                        "/order-confirmation",
                        {
                          state: {
                            order:
                              reconciledOrder,
                          },
                          replace: true,
                        }
                      );
                    }

                    return;
                  }
                }
              } catch (reconcileError) {
                console.error(
                  "Payment reconciliation error:",
                  reconcileError
                );
              }
            }
          }
        } catch (error) {
          console.error(
            "Payment recovery error:",
            error
          );
        }

        // -------------------------------------------
        // WAIT BEFORE TRYING AGAIN
        // -------------------------------------------

        if (
          attempt <
            maxAttempts - 1 &&
          !cancelled
        ) {
          await new Promise(
            (resolve) => {
              timeoutId = setTimeout(
                resolve,
                delay
              );
            }
          );
        }
      }

      if (!cancelled) {
        setIsRecoveringPayment(false);
        setIsProcessing(false);
      }
    };

    recoverPayment();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    isAuthenticated,
    user,
    navigate,
  ]);

  // =================================================
  // TOTAL ITEMS
  // =================================================

  const totalItems =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  // =================================================
  // SELECT SAVED ADDRESS
  // =================================================

  const useSavedAddress = (
    address
  ) => {
    setSelectedAddressId(
      address._id
    );

    setShowNewAddressForm(false);

    setErrors({});

    setAddressError("");

    setFormData((current) => ({
      ...current,

      doorNumber:
        address.doorNumber || "",

      street:
        address.street || "",

      landmark:
        address.landmark || "",

      city:
        address.city || "",

      state:
        address.state || "",

      pincode:
        address.pincode || "",
    }));
  };

  // =================================================
  // USE A DIFFERENT / NEW ADDRESS
  // =================================================

  const startNewAddress = () => {
    setSelectedAddressId("");

    setShowNewAddressForm(true);

    setErrors({});

    setAddressError("");

    setFormData((current) => ({
      ...current,

      doorNumber: "",
      street: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
    }));
  };

  // =================================================
  // INPUT CHANGE
  // =================================================

  const handleChange = (
    event
  ) => {
    const {
      id,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors((current) => ({
        ...current,
        [id]: "",
      }));
    }
  };

  // =================================================
  // VALIDATE CHECKOUT FORM
  // =================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    const phone =
      formData.phone.replace(
        /\D/g,
        ""
      );

    if (!phone) {
      newErrors.phone =
        "Phone number is required.";
    } else if (
      phone.length !== 10 ||
      !/^[6-9]\d{9}$/.test(
        phone
      )
    ) {
      newErrors.phone =
        "Enter a valid 10-digit mobile number.";
    }

    if (
      !formData.doorNumber.trim()
    ) {
      newErrors.doorNumber =
        "Door / house number is required.";
    }

    if (!formData.street.trim()) {
      newErrors.street =
        "Street / area is required.";
    }

    if (!formData.landmark.trim()) {
      newErrors.landmark =
        "Landmark is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state =
        "State is required.";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode =
        "PIN code is required.";
    } else if (
      !/^\d{6}$/.test(
        formData.pincode
      )
    ) {
      newErrors.pincode =
        "PIN code must be exactly 6 digits.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // =================================================
  // CONTINUE TO PAYMENT
  // =================================================

  const handleContinueToPayment =
    async () => {
      if (
        isProcessing ||
        isRecoveringPayment
      ) {
        return;
      }

      const isValid =
        validateForm();

      if (!isValid) {
        alert(
          "Please check the highlighted fields and fill them correctly."
        );

        return;
      }

      try {
        setIsProcessing(true);

        setPaymentVerified(false);

        const token =
          localStorage.getItem(
            "ceresea-token"
          );

        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        // =================================================
        // 1. CREATE CER ESEA ORDER
        // =================================================

        const orderResponse =
          await fetch(
            "/api/orders",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                items: cartItems,

                contact: {
                  fullName:
                    formData.fullName.trim(),

                  email:
                    formData.email.trim(),

                  phone:
                    formData.phone.replace(
                      /\D/g,
                      ""
                    ),
                },

                shippingAddress: {
                  doorNumber:
                    formData.doorNumber.trim(),

                  street:
                    formData.street.trim(),

                  landmark:
                    formData.landmark.trim(),

                  city:
                    formData.city.trim(),

                  state:
                    formData.state.trim(),

                  pincode:
                    formData.pincode.trim(),
                },
              }),
            }
          );

        const orderData =
          await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(
            orderData.message ||
              "Failed to create order"
          );
        }

        console.log(
          "Ceresea order created:",
          orderData.order
        );

        // =================================================
        // 2. CREATE RAZORPAY ORDER
        // =================================================

        const paymentResponse =
          await fetch(
            `/api/payments/create-order/${orderData.order._id}`,
            {
              method: "POST",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const paymentData =
          await paymentResponse.json();

        if (!paymentResponse.ok) {
          throw new Error(
            paymentData.message ||
              "Failed to create Razorpay order"
          );
        }

        console.log(
          "Razorpay order created:",
          paymentData
        );

        // =================================================
        // IMPORTANT:
        // Store recovery data BEFORE opening Razorpay.
        // =================================================

        localStorage.setItem(
          "ceresea-pending-order-id",
          orderData.order._id
        );

        localStorage.setItem(
          "ceresea-razorpay-order-id",
          paymentData.razorpayOrderId
        );

        // =================================================
        // 3. CHECK RAZORPAY CHECKOUT
        // =================================================

        if (!window.Razorpay) {
          throw new Error(
            "Razorpay Checkout failed to load."
          );
        }

        // =================================================
        // 4. RAZORPAY CHECKOUT OPTIONS
        // =================================================

        const options = {
          key:
            paymentData.keyId,

          amount:
            paymentData.amount,

          currency:
            paymentData.currency,

          name: "Ceresea",

          description:
            "Ceresea Luxury Lipcare",

          order_id:
            paymentData.razorpayOrderId,

          prefill: {
            name:
              formData.fullName.trim(),

            email:
              formData.email.trim(),

            contact:
              formData.phone.replace(
                /\D/g,
                ""
              ),
          },

          notes: {
            cereseaOrderId:
              orderData.order._id,
          },

          theme: {
            color: "#C98F98",
          },

          // =================================================
          // PAYMENT SUCCESSFUL ON RAZORPAY
          // =================================================

          handler: async function (
            response
          ) {
            try {
              console.log(
                "Razorpay payment response:",
                response
              );

              const verificationToken =
                localStorage.getItem(
                  "ceresea-token"
                );

              if (!verificationToken) {
                throw new Error(
                  "Authentication token not found."
                );
              }

              // =================================================
              // VERIFY PAYMENT ON BACKEND
              // =================================================

              const verificationResponse =
                await fetch(
                  "/api/payments/verify",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Authorization: `Bearer ${verificationToken}`,
                    },

                    body: JSON.stringify({
                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_signature:
                        response.razorpay_signature,

                      cereseaOrderId:
                        orderData.order._id,
                    }),
                  }
                );

              const verificationData =
                await verificationResponse.json();

              // =================================================
              // PAYMENT VERIFIED
              // =================================================

              if (
                verificationResponse.ok
              ) {
                console.log(
                  "Payment verified:",
                  verificationData
                );

                const verifiedOrder =
                  verificationData.order;

                localStorage.setItem(
                  "ceresea-last-order-id",
                  verifiedOrder.id ||
                    verifiedOrder._id ||
                    orderData.order._id
                );

                localStorage.removeItem(
                  "ceresea-pending-order-id"
                );

                localStorage.removeItem(
                  "ceresea-razorpay-order-id"
                );

                clearCartRef.current();

                navigate(
                  "/order-confirmation",
                  {
                    state: {
                      order:
                        verifiedOrder,
                    },
                    replace: true,
                  }
                );

                return;
              }

              // Verification failed, but DON'T
              // clear recovery data.
              console.error(
                "Payment verification failed:",
                verificationData
              );

              setIsProcessing(false);
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              // Keep pending recovery data.
              setIsProcessing(false);
            }
          },

          // =================================================
          // RAZORPAY POPUP CLOSED
          // =================================================

          modal: {
            ondismiss:
              function () {
                console.log(
                  "Razorpay Checkout closed."
                );

                setIsProcessing(false);
              },
          },
        };

        // =================================================
        // OPEN RAZORPAY
        // =================================================

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.open();
      } catch (error) {
        console.error(
          "Payment initialization error:",
          error
        );

        setIsProcessing(false);
      }
    };

  // =================================================
  // EMPTY CART
  // =================================================

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">

        <div className="checkout-page__empty">

          <p className="checkout-page__eyebrow">
            CHECKOUT
          </p>

          <h1>
            Your bag is empty.
          </h1>

          <p>
            Add something from Ceresea
            before continuing to checkout.
          </p>

          <Link
            to="/product"
            className="checkout-page__shop"
          >
            Shop Ceresea
          </Link>

        </div>

      </main>
    );
  }

  // =================================================
  // GUEST CHECKOUT
  // =================================================

  if (!isAuthenticated) {
    return (
      <main className="checkout-page">

        <div className="checkout-page__guest">

          <p className="checkout-page__eyebrow">
            CHECKOUT
          </p>

          <h1>
            Sign in to
            <span>
              continue.
            </span>
          </h1>

          <p>
            Sign in with Google to
            continue with your Ceresea
            order.
          </p>

          <GoogleLogin
            onSuccess={async (
              credentialResponse
            ) => {
              try {
                const response =
                  await fetch(
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

                const data =
                  await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.message ||
                      "Google login failed"
                  );
                }

                login(
                  data.user,
                  data.token
                );
              } catch (error) {
                console.error(
                  "Checkout login error:",
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

          <Link
            to="/bag"
            className="checkout-page__back"
          >
            ← Back to Bag
          </Link>

        </div>

      </main>
    );
  }

  // =================================================
  // AUTHENTICATED CHECKOUT
  // =================================================

  return (
    <main className="checkout-page">

      <div className="checkout-page__container">

        {/* HEADER */}

        <header className="checkout-page__header">

          <p className="checkout-page__eyebrow">
            CHECKOUT
          </p>

          <h1>
            Complete your order.
          </h1>

        </header>

        <div className="checkout-page__layout">

          {/* CUSTOMER DETAILS */}

          <section className="checkout-page__details">

            {/* CONTACT INFORMATION */}

            <div className="checkout-section">

              <div className="checkout-section__heading">

                <span>
                  01
                </span>

                <h2>
                  Contact Information
                </h2>

              </div>

              <div className="checkout-form">

                {/* EMAIL */}

                <div className="checkout-field">

                  <label htmlFor="email">
                    Email address *
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                  {errors.email && (
                    <small className="checkout-field__error">
                      {
                        errors.email
                      }
                    </small>
                  )}

                </div>

                {/* PHONE */}

                <div className="checkout-field">

                  <label htmlFor="phone">
                    Phone number *
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength="10"
                    autoComplete="tel"
                  />

                  {errors.phone && (
                    <small className="checkout-field__error">
                      {
                        errors.phone
                      }
                    </small>
                  )}

                </div>

              </div>

            </div>

            {/* SAVED ADDRESSES */}

            <div className="checkout-section checkout-section--saved-addresses">

              <div className="checkout-section__heading">

                <span>
                  02
                </span>

                <h2>
                  Delivery Address
                </h2>

              </div>

              {addressesLoading && (
                <p className="checkout-addresses__message">
                  Loading your saved
                  addresses...
                </p>
              )}

              {addressError && (
                <p className="checkout-addresses__error">
                  {addressError}
                </p>
              )}

              {!addressesLoading &&
                savedAddresses.length >
                  0 && (
                  <div className="checkout-addresses">

                    <p className="checkout-addresses__intro">
                      Choose a saved
                      address or enter
                      a new one.
                    </p>

                    <div className="checkout-addresses__list">

                      {savedAddresses.map(
                        (address) => (
                          <button
                            type="button"
                            key={
                              address._id
                            }
                            className={`checkout-address-card ${
                              selectedAddressId ===
                              address._id
                                ? "checkout-address-card--selected"
                                : ""
                            }`}
                            onClick={() =>
                              useSavedAddress(
                                address
                              )
                            }
                          >

                            <span className="checkout-address-card__radio">

                              {selectedAddressId ===
                              address._id
                                ? "✓"
                                : ""}

                            </span>

                            <span className="checkout-address-card__content">

                              <strong>
                                {
                                  address.doorNumber
                                }
                              </strong>

                              <span>
                                {
                                  address.street
                                }
                              </span>

                              {address.landmark && (
                                <span>
                                  Near{" "}
                                  {
                                    address.landmark
                                  }
                                </span>
                              )}

                              <span>
                                {
                                  address.city
                                }
                                ,{" "}
                                {
                                  address.state
                                }{" "}
                                {
                                  address.pincode
                                }
                              </span>

                            </span>

                          </button>
                        )
                      )}

                    </div>

                  </div>
                )}

              {savedAddresses.length >
                0 && (
                <button
                  type="button"
                  className="checkout-addresses__new"
                  onClick={
                    startNewAddress
                  }
                >
                  + Use a different
                  address
                </button>
              )}

            </div>

            {/* NEW / SELECTED DELIVERY ADDRESS */}

            {(showNewAddressForm ||
              savedAddresses.length ===
                0) && (
              <div className="checkout-section">

                <div className="checkout-section__heading">

                  <span>
                    02
                  </span>

                  <h2>
                    Delivery Address
                  </h2>

                </div>

                <div className="checkout-form">

                  {/* FULL NAME */}

                  <div className="checkout-field checkout-field--full">

                    <label htmlFor="fullName">
                      Full name *
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                    />

                    {errors.fullName && (
                      <small className="checkout-field__error">
                        {
                          errors.fullName
                        }
                      </small>
                    )}

                  </div>

                  {/* DOOR NUMBER */}

                  <div className="checkout-field">

                    <label htmlFor="doorNumber">
                      Door / House number *
                    </label>

                    <input
                      id="doorNumber"
                      type="text"
                      value={
                        formData.doorNumber
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 12-4-56"
                      autoComplete="address-line1"
                    />

                    {errors.doorNumber && (
                      <small className="checkout-field__error">
                        {
                          errors.doorNumber
                        }
                      </small>
                    )}

                  </div>

                  {/* STREET */}

                  <div className="checkout-field">

                    <label htmlFor="street">
                      Street / Area *
                    </label>

                    <input
                      id="street"
                      type="text"
                      value={
                        formData.street
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Street or area"
                      autoComplete="address-line2"
                    />

                    {errors.street && (
                      <small className="checkout-field__error">
                        {
                          errors.street
                        }
                      </small>
                    )}

                  </div>

                  {/* LANDMARK */}

                  <div className="checkout-field checkout-field--full">

                    <label htmlFor="landmark">
                      Landmark *
                    </label>

                    <input
                      id="landmark"
                      type="text"
                      value={
                        formData.landmark
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Near Central Mall"
                      autoComplete="address-line3"
                    />

                    {errors.landmark && (
                      <small className="checkout-field__error">
                        {
                          errors.landmark
                        }
                      </small>
                    )}

                  </div>

                  {/* CITY */}

                  <div className="checkout-field">

                    <label htmlFor="city">
                      City *
                    </label>

                    <input
                      id="city"
                      type="text"
                      value={
                        formData.city
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="City"
                      autoComplete="address-level2"
                    />

                    {errors.city && (
                      <small className="checkout-field__error">
                        {
                          errors.city
                        }
                      </small>
                    )}

                  </div>

                  {/* STATE */}

                  <div className="checkout-field">

                    <label htmlFor="state">
                      State *
                    </label>

                    <input
                      id="state"
                      type="text"
                      value={
                        formData.state
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="State"
                      autoComplete="address-level1"
                    />

                    {errors.state && (
                      <small className="checkout-field__error">
                        {
                          errors.state
                        }
                      </small>
                    )}

                  </div>

                  {/* PIN */}

                  <div className="checkout-field">

                    <label htmlFor="pincode">
                      PIN code *
                    </label>

                    <input
                      id="pincode"
                      type="text"
                      value={
                        formData.pincode
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="6-digit PIN code"
                      inputMode="numeric"
                      maxLength="6"
                      autoComplete="postal-code"
                    />

                    {errors.pincode && (
                      <small className="checkout-field__error">
                        {
                          errors.pincode
                        }
                      </small>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* PAYMENT */}

            <div className="checkout-section">

              <div className="checkout-section__heading">

                <span>
                  03
                </span>

                <h2>
                  Payment
                </h2>

              </div>

              <div className="checkout-payment">

                {isRecoveringPayment ? (
                  <p>
                    Checking your
                    payment status...
                  </p>
                ) : paymentVerified ? (
                  <p>
                    Payment verified
                    successfully.
                  </p>
                ) : (
                  <p>
                    Secure payment
                    options will be
                    available when
                    you continue.
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* ORDER SUMMARY */}

          <aside className="checkout-page__summary">

            <div className="checkout-summary__heading">

              <h2>
                Your Order
              </h2>

              <span>
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}
              </span>

            </div>

            <div className="checkout-summary__items">

              {cartItems.map(
                (item) => (
                  <div
                    className="checkout-summary__item"
                    key={`${item.productId}-${item.shadeId}`}
                  >

                    <div className="checkout-summary__image">

                      <img
                        src={
                          item.image
                        }
                        alt={`${item.productName} ${item.shadeName}`}
                      />

                    </div>

                    <div className="checkout-summary__info">

                      <strong>
                        {
                          item.productName
                        }
                      </strong>

                      <span>
                        {
                          item.shadeName
                        }{" "}
                        ×{" "}
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

            <div className="checkout-summary__totals">

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{cartTotal}
                </strong>

              </div>

              <div>

                <span>
                  Shipping
                </span>

                <span>
                  Calculated at checkout
                </span>

              </div>

              <div className="checkout-summary__total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{cartTotal}
                </strong>

              </div>

            </div>

            <button
              type="button"
              className="checkout-summary__button"
              onClick={
                handleContinueToPayment
              }
              disabled={
                isProcessing ||
                isRecoveringPayment ||
                paymentVerified
              }
            >
              {isRecoveringPayment
                ? "Checking payment..."
                : paymentVerified
                ? "Payment Verified"
                : isProcessing
                ? "Processing..."
                : "Continue to Payment"}
            </button>

            <Link
              to="/bag"
              className="checkout-summary__back"
            >
              ← Back to Bag
            </Link>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Checkout;