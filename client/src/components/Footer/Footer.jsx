import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer__container">

        {/* BRAND */}

        <div className="footer__brand">
          <a href="/" className="footer__logo">
            ceresea
          </a>

          <p className="footer__tagline">
            Everyday Care.
            <br />
            A Touch of Luxury.
          </p>
        </div>


        {/* LINKS */}

        <div className="footer__links">

          <div className="footer__column">
            <h3>Shop</h3>

            <a href="/product">
              Our Lip Balm
            </a>

            <a href="/product">
              All Shades
            </a>
          </div>


          <div className="footer__column">
            <h3>Customer Care</h3>

            <a href="#">
              Shipping & Returns
            </a>

            <a href="#">
              Contact Us
            </a>
          </div>


          <div className="footer__column">
            <h3>Follow</h3>

            <a
              href="#"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>

        </div>

      </div>


      {/* BOTTOM */}

      <div className="footer__bottom">

        <p>
          © {new Date().getFullYear()} Ceresea
        </p>

        <div className="footer__legal">
          <a href="#">
            Privacy Policy
          </a>

          <a href="#">
            Terms & Conditions
          </a>
        </div>

      </div>

    </footer>
  );
}

export default Footer;