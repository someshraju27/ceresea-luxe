import { Link } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-page__empty">
          <p className="cart-page__eyebrow">YOUR BAG</p>

          <h1>Your bag is empty.</h1>

          <p>
            Discover Ceresea and find a shade made for you.
          </p>

          <Link to="/product" className="cart-page__shop">
            Shop Ceresea
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-page__container">

        {/* Header */}
        <header className="cart-page__header">
          <div>
            <p className="cart-page__eyebrow">YOUR BAG</p>

            <h1>Your Ceresea.</h1>
          </div>

          <span className="cart-page__count">
            {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"}
          </span>
        </header>

        {/* Main Content */}
        <div className="cart-page__layout">

          {/* Cart Items */}
          <section className="cart-page__items">
            {cartItems.map((item) => (
              <article
                className="cart-page__item"
                key={`${item.productId}-${item.shadeId}`}
              >
                {/* Image */}
                <div
                  className="cart-page__image-wrap"
                  style={{
                    "--shade-color": item.shadeColor,
                  }}
                >
                  <div className="cart-page__glow"></div>

                  <img
                    src={item.image}
                    alt={`${item.productName} ${item.shadeName} lip balm`}
                    className="cart-page__image"
                  />
                </div>

                {/* Information */}
                <div className="cart-page__info">
                  <h2>{item.productName}</h2>

                  <p className="cart-page__shade">
                    <span
                      style={{
                        backgroundColor: item.shadeColor,
                      }}
                    ></span>

                    {item.shadeName}
                  </p>

                  <p className="cart-page__unit-price">
                    ₹{item.price}
                  </p>
                </div>

                {/* Quantity */}
                <div className="cart-page__quantity">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.shadeId,
                        item.quantity - 1
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.shadeId,
                        item.quantity + 1
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Total */}
                <strong className="cart-page__item-total">
                  ₹{item.price * item.quantity}
                </strong>

                {/* Remove */}
                <button
                  type="button"
                  className="cart-page__remove"
                  onClick={() =>
                    removeFromCart(
                      item.productId,
                      item.shadeId
                    )
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </section>

          {/* Summary */}
          <aside className="cart-page__summary">

            <div className="cart-page__summary-header">
              <span>Order Summary</span>
            </div>

            <div className="cart-page__summary-row">
              <span>Subtotal</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <div className="cart-page__summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="cart-page__summary-total">
              <span>Total</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <Link
                to="/checkout"
                className="cart-page__checkout"
                >
                Proceed to Checkout
                </Link>

            <Link
              to="/product"
              className="cart-page__continue"
            >
              Continue Shopping
            </Link>

          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;