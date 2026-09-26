import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero__container container">

        {/* =========================
            CONTENT
        ========================= */}

        <div className="hero__content">

          <p className="hero__eyebrow">
            LUXURY LIP CARE
          </p>

          <h1 className="hero__title">
            Everyday care,
            <span>beautiful lips.</span>
          </h1>

          <p className="hero__description">
            Simple, nourishing lip care made for
            your everyday routine.
          </p>

          <a
            href="/product"
            className="hero__button"
          >
            Discover Ceresea
            <span>→</span>
          </a>

        </div>


        {/* =========================
            PRODUCT VISUAL
        ========================= */}

        <div className="hero__visual">

          <div className="hero__glow"></div>

          <img
            src="/hero-product.png"
            alt="Ceresea Luxury Lip Care"
            className="hero__image"
          />

          <div className="hero__badge">
            <span>6</span>
            shades
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;