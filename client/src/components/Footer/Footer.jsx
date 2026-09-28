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

          <div className="footer__column">
            <h3>Shop</h3>

            <Link to="/">Home</Link>

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

            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Email Us
            </a>
          </div>

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