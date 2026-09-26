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

  return (
    <main
      className="product-page"
      style={{ "--shade-color": selectedShade.color }}
    >
      <div className="product-page__container">

        {/* Product Visual */}
        <div className="product-page__visual">
          <div className="product-page__glow"></div>

          <img
            src={selectedShade.image}
            alt={`${product.name} ${selectedShade.name} lip balm`}
            className="product-page__image"
          />
        </div>

        {/* Product Information */}
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

          {/* Shade */}
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
                  onClick={() => {
                    setSelectedIndex(index);
                    setQuantity(1);
                  }}
                  aria-label={`Select ${shade.name}`}
                  aria-pressed={selectedIndex === index}
                >
                  <span
                    style={{
                      backgroundColor: shade.color,
                    }}
                  ></span>
                </button>
              ))}
            </div>

          </div>

          {/* Purchase */}
          <div className="product-page__purchase">

            <div className="product-page__quantity">

              <button
                type="button"
                onClick={() => {
                  if (isInBag) {
                    handleUpdateBagQuantity(
                      Math.max(1, cartItem.quantity - 1)
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
                {isInBag ? cartItem.quantity : quantity}
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
              {isInBag ? "Added to Bag" : "Add to Bag"}
            </button>

          </div>

          {/* View Bag */}
          {hasItemsInBag && (
                <Link
                    to="/bag"
                    className="product-page__view-bag"
                >
                    View Bag
                    <span>→</span>
                </Link>
                )}

          {/* Product Details */}
          <div className="product-page__details">

            <div className="product-page__detail">
              <span>Net quantity</span>
              <strong>{product.netQuantity}</strong>
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