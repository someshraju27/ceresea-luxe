import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { product } from "../../data/productData";
import "./ProductPage.css";

function ProductPage() {
  const {
    cartItems,
    addToCart,
    updateQuantity,
  } = useCart();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedShade = product.shades[selectedIndex];

  const cartItem = cartItems.find(
    (item) =>
      item.productId === product.id &&
      item.shadeId === selectedShade.id
  );

  const isInBag = Boolean(cartItem);
  const hasItemsInBag = cartItems.length > 0;

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const selectShade = (index) => {
    setSelectedIndex(index);
    setQuantity(1);
  };

  const handleAddToBag = () => {
    addToCart(product, selectedShade, quantity);
  };

  const handleUpdateBagQuantity = (newQuantity) => {
    updateQuantity(
      product.id,
      selectedShade.id,
      newQuantity
    );
  };

  /* =========================================================
     MOBILE SWIPE
  ========================================================= */

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    event.currentTarget.dataset.touchStartX = touch.clientX;
  };

  const handleTouchEnd = (event) => {
    const touchStartX = Number(
      event.currentTarget.dataset.touchStartX
    );

    if (!touchStartX) return;

    const touchEndX = event.changedTouches[0].clientX;
    const difference = touchStartX - touchEndX;

    const swipeThreshold = 50;

    if (Math.abs(difference) < swipeThreshold) {
      return;
    }

    if (difference > 0) {
      // Swipe left → next shade
      setSelectedIndex((current) =>
        current === product.shades.length - 1
          ? 0
          : current + 1
      );
    } else {
      // Swipe right → previous shade
      setSelectedIndex((current) =>
        current === 0
          ? product.shades.length - 1
          : current - 1
      );
    }

    setQuantity(1);

    delete event.currentTarget.dataset.touchStartX;
  };

  const shadeSelector = (
    <div className="product-page__shade">
      <div className="product-page__shade-header">
        <span>Shade</span>
        <strong>{selectedShade.name}</strong>
      </div>

      <div className="product-page__swatches">
        {product.shades.map((shade, index) => (
          <button
            key={shade.id}
            type="button"
            className={`product-page__swatch ${
              selectedIndex === index
                ? "product-page__swatch--active"
                : ""
            }`}
            onClick={() => selectShade(index)}
            aria-label={`Select ${shade.name}`}
            aria-pressed={selectedIndex === index}
          >
            <span
              style={{
                backgroundColor: shade.color,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main
      className="product-page"
      style={{ "--shade-color": selectedShade.color }}
    >
      <div className="product-page__container">

        {/* =====================================================
            PRODUCT VISUAL
        ===================================================== */}

        <div
          className="product-page__visual"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="product-page__glow" />

          <img
            src={selectedShade.image}
            alt={`${product.name} ${selectedShade.name} lip balm`}
            className="product-page__image"
            draggable="false"
          />

          {/* Mobile shade selector */}
          <div className="product-page__mobile-shade">
            {shadeSelector}
          </div>
        </div>

        {/* =====================================================
            PRODUCT INFORMATION
        ===================================================== */}

        <div className="product-page__content">

          <p className="product-page__eyebrow">
            THE CERESEA LIP BALM
          </p>

          <h1 className="product-page__title">
            Everyday care,
            <span>beautifully made.</span>
          </h1>

          <p className="product-page__price">
            ₹{product.price}
          </p>

          {/* Desktop shade selector */}
          <div className="product-page__desktop-shade">
            {shadeSelector}
          </div>

          {/* =================================================
              PURCHASE
          ================================================= */}

          <div className="product-page__purchase">

            <div className="product-page__quantity">

              <button
                type="button"
                onClick={() => {
                  if (isInBag) {
                    handleUpdateBagQuantity(
                      Math.max(
                        1,
                        cartItem.quantity - 1
                      )
                    );
                  } else {
                    decreaseQuantity();
                  }
                }}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>
                {isInBag
                  ? cartItem.quantity
                  : quantity}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (isInBag) {
                    handleUpdateBagQuantity(
                      cartItem.quantity + 1
                    );
                  } else {
                    increaseQuantity();
                  }
                }}
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>

            <button
              type="button"
              className={`product-page__add ${
                isInBag
                  ? "product-page__add--added"
                  : ""
              }`}
              onClick={handleAddToBag}
              disabled={isInBag}
            >
              {isInBag
                ? "Added to Bag"
                : "Add to Bag"}
            </button>

          </div>

          {/* =================================================
              VIEW BAG
          ================================================= */}

          {hasItemsInBag && (
            <Link
              to="/bag"
              className="product-page__view-bag"
            >
              View Bag
              <span>→</span>
            </Link>
          )}

          {/* =================================================
              PRODUCT DETAILS
          ================================================= */}

          <div className="product-page__details">

            <div className="product-page__detail">
              <span>Net quantity</span>
              <strong>
                {product.netQuantity}
              </strong>
            </div>

            <div className="product-page__detail">
              <span>Ingredients</span>
              <strong>
                {product.ingredients.join(" • ")}
              </strong>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}

export default ProductPage;