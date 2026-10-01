import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL;

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
          {/* SHOP */}
          <div className="footer__column">
            <h3>Shop</h3>

            <Link to="/">Home</Link>

            <Link to="/product">Our Lip Balm</Link>

            <a href="/#about">About</a>

            <Link to="/bag">Bag</Link>
          </div>

          {/* LEGAL */}
          <div className="footer__column">
            <h3>Legal</h3>

            <Link to="/terms">
              Terms & Conditions
            </Link>

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/refund-policy">
              Refund & Cancellation
            </Link>
          </div>

          {/* CUSTOMER CARE */}
          <div className="footer__column">
            <h3>Customer Care</h3>

            <a href={`mailto:${contactEmail}`}>
              Email Us
            </a>
          </div>

          {/* FOLLOW */}
          <div className="footer__column">
            <h3>Follow</h3>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
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