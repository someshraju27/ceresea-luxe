import "./Privacy.css";

function Privacy() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;

  return (
    <main className="legal-page">
      <div className="legal-page__container">
        <p className="legal-page__eyebrow">CERESEA</p>

        <h1>Privacy Policy</h1>

        <p className="legal-page__updated">
          Last updated: September 2026
        </p>

        <section className="legal-page__section">
          <h2>1. Introduction</h2>

          <p>
            Ceresea respects your privacy and is committed to
            protecting the personal information you provide while
            using our website.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Information We Collect</h2>

          <p>
            Depending on how you use the website, we may collect
            information such as your name, email address, phone
            number, delivery address, order details, and account
            information.
          </p>

          <p>
            When you sign in using Google, information provided by
            Google for authentication, such as your name, email
            address, and profile information, may be associated
            with your Ceresea account.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. How We Use Your Information</h2>

          <p>
            We use your information to create and manage your
            account, process and fulfil orders, communicate with
            you about your orders, provide customer support, and
            maintain and improve the website.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Payment Information</h2>

          <p>
            Payments on Ceresea are processed through Razorpay.
            Payment processing is handled by Razorpay through its
            payment systems.
          </p>

          <p>
            Ceresea does not store your card, UPI, or other
            payment instrument credentials.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Sharing of Information</h2>

          <p>
            We may share information with service providers when
            necessary to operate the website and provide services
            to you, including authentication, payment processing,
            order fulfilment, and customer support.
          </p>

          <p>
            We do not sell your personal information to third
            parties.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Cookies & Local Storage</h2>

          <p>
            The website may use browser storage and similar
            technologies to provide features such as maintaining
            your shopping bag and keeping your website experience
            functional.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>7. Data Security</h2>

          <p>
            We take reasonable measures to protect the information
            handled through the website. However, no method of
            electronic transmission or storage can be guaranteed
            to be completely secure.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Your Information</h2>

          <p>
            You may manage information associated with your Ceresea
            account through the available account features. If you
            have questions about your personal information or need
            assistance, you can contact us using the email below.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Changes to This Policy</h2>

          <p>
            We may update this Privacy Policy when necessary.
            Changes will be published on this page with a revised
            update date.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>10. Contact Us</h2>

          <p>
            For privacy-related questions or requests, contact:
          </p>

          <a
            href={`mailto:${contactEmail}`}
            className="legal-page__email"
          >
            {contactEmail}
          </a>
        </section>
      </div>
    </main>
  );
}

export default Privacy;