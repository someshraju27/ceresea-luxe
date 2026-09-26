import { useState } from "react";
import "./Navbar.css";
import { useCart } from "../../context/cartContext";

function Navbar() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">

      <div className="navbar__inner">

        {/* Logo */}
        <a
          href="/"
          className="navbar__logo"
          onClick={closeMenu}
        >
          ceresea
        </a>


        {/* Desktop Navigation */}
        <nav className="navbar__links">
          <a href="/">Home</a>
          <a href="/product">Our Lip Balm</a>
          <a href="#about">About</a>
        </nav>


        {/* Desktop Actions */}
        <div className="navbar__actions">
          <a href="/account">Account</a>
          <a href="/bag"> Bag{cartCount > 0 ? ` (${cartCount})` : ""} </a>
        </div>


        {/* Mobile Menu Button */}
        <button
          type="button"
          className={`navbar__menu ${
            menuOpen ? "navbar__menu--open" : ""
          }`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>


      {/* Mobile Menu */}
      <div
        id="mobile-navigation"
        className={`navbar__mobile-menu ${
          menuOpen ? "navbar__mobile-menu--open" : ""
        }`}
      >
        <nav aria-label="Mobile navigation">

          <a href="/" onClick={closeMenu}>
            Home
          </a>

          <a href="/product" onClick={closeMenu}>
            Our Lip Balm
          </a>

          <a href="#about" onClick={closeMenu}>
            About
          </a>

          <a href="/account" onClick={closeMenu}>
            Account
          </a>

          <a href="/bag" onClick={closeMenu}> Bag{cartCount > 0 ? ` (${cartCount})` : ""} </a>

        </nav>
      </div>

    </header>
  );
}

export default Navbar;