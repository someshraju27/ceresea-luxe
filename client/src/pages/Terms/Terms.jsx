import "./Terms.css";

function Terms() {
    const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;
  return (
    <main className="legal-page">
      <div className="legal-page__container">
        <p className="legal-page__eyebrow">
          CERESEA
        </p>

        <h1>Terms & Conditions</h1>

        <p className="legal-page__updated">
          Last updated: September 2026
        </p>

        <section className="legal-page__section">
          <h2>1. About Ceresea</h2>

          <p>
            Ceresea is an online store offering Ceresea lipcare
            products through this website. By using this website
            or placing an order, you agree to these Terms &
            Conditions.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Products & Information</h2>

          <p>
            We make reasonable efforts to ensure that product
            descriptions, images, prices, shades, and other
            information displayed on the website are accurate.
            Product colours may appear slightly different
            depending on your device and screen settings.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Pricing</h2>

          <p>
            Product prices are displayed on the website in Indian
            Rupees (INR). The applicable price at the time you
            place your order will be charged.
          </p>

          <p>
            Ceresea reserves the right to update product prices
            or other website information when necessary.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Orders</h2>

          <p>
            An order is placed when you complete the checkout
            process and successfully submit your order.
            Ceresea reserves the right to cancel or decline an
            order where necessary, including in cases of
            incorrect information, payment issues, or other
            circumstances affecting fulfilment.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Payments</h2>

          <p>
            Payments are processed securely through Razorpay.
            Ceresea does not store your card, UPI, or other
            payment instrument credentials.
          </p>

          <p>
            Your order may be confirmed after successful payment
            verification.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Order Cancellation</h2>

          <p>
            Customers may cancel an order while the order status
            is <strong>Confirmed</strong>.
          </p>

          <p>
            If a cancelled order has already been paid for,
            Ceresea will initiate a refund through Razorpay.
            Please refer to our{" "}
            <a href="/refund-policy">
              Refund & Cancellation Policy
            </a>{" "}
            for more information.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>7. Returns</h2>

          <p>
            Ceresea currently does not offer general returns after
            delivery.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Account</h2>

          <p>
            Some features of the website require you to sign in.
            You are responsible for providing accurate information
            and for keeping your account access secure.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Website Use</h2>

          <p>
            You agree not to misuse the website, interfere with
            its operation, attempt unauthorized access, or use
            the website for unlawful purposes.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>10. Intellectual Property</h2>

          <p>
            The Ceresea name, branding, website content, product
            imagery, graphics, text, and other materials available
            on this website belong to Ceresea or are used with
            appropriate permission. They may not be copied,
            reproduced, or used commercially without permission.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>11. Changes to These Terms</h2>

          <p>
            Ceresea may update these Terms & Conditions when
            necessary. Any updated version will be published on
            this page with a revised update date.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>12. Contact Us</h2>

          <p>
            If you have questions about these Terms & Conditions,
            contact us at:
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

export default Terms;