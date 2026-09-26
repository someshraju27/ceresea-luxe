import "./BrandIntro.css";

function BrandIntro() {
  return (
    <section id="about" className="brand-intro">
      <div className="brand-intro__container container">

        <p className="brand-intro__eyebrow">
          THE CERESSEA STORY
        </p>

        <h2 className="brand-intro__title">
          Where beauty
          <span>meets care.</span>
        </h2>

        <p className="brand-intro__description">
          Ceresea is a luxury lipcare brand created to make
          everyday lip care feel simple, nourishing, and beautiful.
        </p>

        <div className="brand-intro__divider">
          <span></span>
          <i>✦</i>
          <span></span>
        </div>

        <p className="brand-intro__closing">
          Made for your everyday routine — at home, at work,
          or wherever the day takes you.
        </p>

      </div>
    </section>
  );
}

export default BrandIntro;