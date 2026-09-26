import { useState } from "react";
import { product } from "../../data/productData";
import "./FeaturedProduct.css";

function FeaturedProduct() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedShade = product.shades[selectedIndex];

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  return (
    <section
      className="featured-product"
      style={{
        "--shade-color": selectedShade.color,
      }}
    >
      <div className="featured-product__container">

        {/* =========================
            PRODUCT VISUAL
        ========================= */}

        <div className="featured-product__visual">

          <div className="featured-product__glow"></div>

          <img
            src={selectedShade.image}
            alt={`${product.name} ${selectedShade.name} lip balm`}
            className="featured-product__image"
          />

        </div>


        {/* =========================
            PRODUCT INFORMATION
        ========================= */}

        <div className="featured-product__content">

          <p className="featured-product__eyebrow">
            THE CERESEA LIP BALM
          </p>

          <h2 className="featured-product__title">
            Everyday care,
            <span>beautifully made.</span>
          </h2>

          {/* <p className="featured-product__description">
            Everyday lip care made to feel simple,
            nourishing, and beautiful.
          </p> */}


          {/* PRICE */}

          <p className="featured-product__price">
            ₹{product.price}
          </p>


          {/* SHADE */}

          <div className="featured-product__shade">

            <div className="featured-product__shade-header">
              <span>Shade</span>
              <strong>{selectedShade.name}</strong>
            </div>

            <div className="featured-product__swatches">

              {product.shades.map((shade, index) => (
                <button
                  key={shade.id}
                  type="button"
                  className={`featured-product__swatch ${
                    selectedIndex === index
                      ? "featured-product__swatch--active"
                      : ""
                  }`}
                  onClick={() => setSelectedIndex(index)}
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


          {/* PURCHASE */}

          <div className="featured-product__purchase">

            <div className="featured-product__quantity">

              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={increaseQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>


            <button
              type="button"
              className="featured-product__add"
            >
              Add to Bag
            </button>

          </div>


          {/* PRODUCT DETAILS */}

          <div className="featured-product__details">

            <div className="featured-product__detail">
              <span>Net quantity</span>
              <strong>{product.netQuantity}</strong>
            </div>

            <div className="featured-product__detail">
              <span>Ingredients</span>
              <strong>
                {product.ingredients.join(" • ")}
              </strong>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default FeaturedProduct;