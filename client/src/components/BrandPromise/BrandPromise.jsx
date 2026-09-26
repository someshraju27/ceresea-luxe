import "./BrandPromise.css";

function BrandPromise() {
  return (
    <section className="brand-promise">

      <div className="brand-promise__container">

        <p className="brand-promise__eyebrow">
          THE CERESSEA PHILOSOPHY
        </p>

        <h2 className="brand-promise__title">
          Everyday Care.
          <span>A Touch of Luxury.</span>
        </h2>

        <p className="brand-promise__description">
          Simple lip care designed to become part
          of your everyday ritual.
        </p>

        <div className="brand-promise__line"></div>

        <div className="brand-promise__values">

          <div className="brand-promise__value">
            <span>01</span>
            <h3>Nourish</h3>
            <p>
              Thoughtful care for soft,
              comfortable lips.
            </p>
          </div>

          <div className="brand-promise__value">
            <span>02</span>
            <h3>Protect</h3>
            <p>
              Everyday care made for
              your daily routine.
            </p>
          </div>

          <div className="brand-promise__value">
            <span>03</span>
            <h3>Carry</h3>
            <p>
              Easy to keep close,
              wherever the day takes you.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default BrandPromise;