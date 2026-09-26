import "./FinalCTA.css";

function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="final-cta__container">

        <p className="final-cta__eyebrow">
          EVERYDAY CARE
        </p>

        <h2 className="final-cta__title">
          A little luxury,
          <span>every single day.</span>
        </h2>

        <p className="final-cta__description">
          Discover Ceresea and find the shade
          that belongs in your everyday routine.
        </p>

        <a
          href="/product"
          className="final-cta__button"
        >
          Explore Ceresea
          <span>→</span>
        </a>

      </div>
    </section>
  );
}

export default FinalCTA;