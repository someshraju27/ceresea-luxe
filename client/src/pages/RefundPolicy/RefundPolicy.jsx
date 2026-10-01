import "./RefundPolicy.css";

function RefundPolicy() {
    const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;
  return (
    <main className="legal-page">
      <div className="legal-page__container">
        <p className="legal-page__eyebrow">
          CERESEA
        </p>

        <h1>Refund & Cancellation Policy</h1>

        <p className="legal-page__updated">
          Last updated: September 2026
        </p>

        <section className="legal-page__section">
          <h2>1. Order Cancellation</h2>

          <p>
            Customers can cancel an order while the order status
            is <strong>Confirmed</strong>.
          </p>

          <p>
            Once an order has moved beyond the Confirmed status,
            cancellation may no longer be available.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Paid Orders</h2>

          <p>
            If you cancel a paid order while cancellation is
            available, Ceresea will initiate a refund through
            Razorpay.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Refund Method</h2>

          <p>
            Refunds for cancelled paid orders will be processed
            through the payment system used for the original
            transaction.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Refund Processing</h2>

          <p>
            After a cancellation is successfully processed,
            Ceresea will initiate the applicable refund.
            The time taken for the refunded amount to appear in
            your account may depend on the payment method and
            the relevant payment service provider.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Unpaid Orders</h2>

          <p>
            Orders that have not been successfully paid do not
            require a payment refund. If such an order is
            cancelled, no payment amount will be returned because
            no successful payment was received for the order.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Returns</h2>

          <p>
            Ceresea currently does not offer general returns after
            delivery.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>7. Refund Questions</h2>

          <p>
            If you have a question regarding an order
            cancellation or refund, please contact us with your
            order details.
          </p>

          <a
            href={`mailto:${contactEmail}`}
            className="legal-page__email"
          >
            {contactEmail}
          </a>
        </section>

        <section className="legal-page__section">
          <h2>8. Policy Updates</h2>

          <p>
            Ceresea may update this policy when necessary. Any
            changes will be published on this page with a revised
            update date.
          </p>
        </section>
      </div>
    </main>
  );
}

export default RefundPolicy;