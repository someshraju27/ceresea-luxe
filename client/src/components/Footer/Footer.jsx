import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">

        {/* BRAND */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            ceresea
          </Link>

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

            <Link to="/">
              Home
            </Link>

            <Link to="/product">
              Our Lip Balm
            </Link>

            <Link to="/#about">
              About
            </Link>

            <Link to="/bag">
              Bag
            </Link>
          </div>

          <div className="footer__column">
            <h3>Customer Care</h3>

            <a href="mailto:hello@ceresea.luxe">
              Email Us
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

        <p className="footer__made">
          Made with care.
        </p>

      </div>
    </footer>
  );
}

export default Footer;