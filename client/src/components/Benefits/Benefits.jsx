import "./Benefits.css";

const benefits = [
  {
    number: "01",
    title: "Everyday Care",
    description:
      "A simple lip care essential designed to fit naturally into your everyday routine.",
    icon: "✦",
  },
  {
    number: "02",
    title: "Nourishing Care",
    description:
      "Created to help keep your lips feeling soft, smooth and comfortable.",
    icon: "♡",
  },
  {
    number: "03",
    title: "Made to Go",
    description:
      "A lightweight stick format that makes everyday lip care easy to carry wherever you go.",
    icon: "◇",
  },
  {
    number: "04",
    title: "Six Shades",
    description:
      "Choose from six colourful variants and find the Ceresea shade that feels right for you.",
    icon: "✧",
  },
];

function Benefits() {
  return (
    <section className="benefits">
      <div className="benefits__container container">

        {/* LEFT SIDE */}
        <div className="benefits__intro">

          <p className="benefits__eyebrow">
            WHY CERESEA
          </p>

          <h2 className="benefits__title">
            Care that fits
            <span>your everyday.</span>
          </h2>

          <p className="benefits__subtitle">
            Simple, thoughtful lip care designed to become
            part of your daily ritual.
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="benefits__grid">

          {benefits.map((benefit) => (
            <article
              className="benefit-card"
              key={benefit.number}
            >

              <div className="benefit-card__top">

                <span className="benefit-card__number">
                  {benefit.number}
                </span>

                <span className="benefit-card__icon">
                  {benefit.icon}
                </span>

              </div>

              <div className="benefit-card__content">

                <h3>
                  {benefit.title}
                </h3>

                <p>
                  {benefit.description}
                </p>

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Benefits;