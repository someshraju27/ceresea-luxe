
import { useRef, useState } from "react";
import "./ShadeShowcase.css";

import { shades } from "../../data/productData";

function ShadeShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const touchStartX = useRef(null);

  const selectedShade = shades[selectedIndex];

  /* --------------------------------
     CHANGE SHADE
  -------------------------------- */

  const goToShade = (index) => {
    setSelectedIndex(index);
  };

  const nextShade = () => {
    setSelectedIndex((currentIndex) => {
      return (currentIndex + 1) % shades.length;
    });
  };

  const previousShade = () => {
    setSelectedIndex((currentIndex) => {
      return (
        (currentIndex - 1 + shades.length) %
        shades.length
      );
    });
  };

  /* --------------------------------
     SWIPE HANDLERS
  -------------------------------- */

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;

    const distance = touchStartX.current - touchEndX;

    const swipeThreshold = 50;

    if (Math.abs(distance) >= swipeThreshold) {
      if (distance > 0) {
        // Swipe left
        nextShade();
      } else {
        // Swipe right
        previousShade();
      }
    }

    touchStartX.current = null;
  };

  return (
    <section className="shade-showcase">
      <div className="shade-showcase__container container">

        {/* --------------------------------
            HEADING
        -------------------------------- */}

        <div className="shade-showcase__heading">

          <p className="shade-showcase__eyebrow">
            FIND YOUR FAVOURITE
          </p>

          <h2 className="shade-showcase__title">
            Six shades.
            <span>One everyday ritual.</span>
          </h2>

          <p className="shade-showcase__intro">
            Discover the Ceresea lip balm in a shade
            made to suit your mood.
          </p>

        </div>


        {/* --------------------------------
            PRODUCT AREA
        -------------------------------- */}

        <div
          className="shade-showcase__product"
          style={{
            "--shade-color": selectedShade.color,
          }}
        >

          {/* --------------------------------
              SHADE SELECTOR
          -------------------------------- */}

          <div className="shade-selector">

            {shades.map((shade, index) => (

              <button
                key={shade.id}
                className={`shade-selector__item ${
                  selectedIndex === index
                    ? "shade-selector__item--active"
                    : ""
                }`}
                onClick={() => goToShade(index)}
                aria-label={`Select ${shade.name}`}
                aria-pressed={selectedIndex === index}
              >

                <span
                  className="shade-selector__dot"
                  style={{
                    backgroundColor: shade.color,
                  }}
                />

                <span className="shade-selector__name">
                  {shade.name}
                </span>

              </button>

            ))}

          </div>


          {/* --------------------------------
              PRODUCT IMAGE
          -------------------------------- */}

          <div
            className="shade-showcase__image-wrapper"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >

            <div className="shade-showcase__glow"></div>

            <img
              src={selectedShade.image}
              alt={`Ceresea ${selectedShade.name} lip balm`}
              className="shade-showcase__image"
              draggable="false"
            />

            {/* Mobile swipe hint */}

            <span className="shade-showcase__swipe-hint">
              ← swipe →
            </span>

          </div>


          {/* --------------------------------
              PRODUCT INFORMATION
          -------------------------------- */}

          <div className="shade-showcase__info">

            <p className="shade-showcase__label">
              SELECTED SHADE
            </p>

            <h3>
              {selectedShade.name}
            </h3>

            <p className="shade-showcase__description">
              {selectedShade.description}
            </p>

            <a
              href="/product"
              className="shade-showcase__button"
            >
              Explore Lip Balm
              <span>→</span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ShadeShowcase;