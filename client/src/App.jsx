import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import FinalCTA from "./components/FinalCTA/FinalCTA";
import BrandIntro from "./components/BrandIntro/BrandIntro";
import ShadeShowcase from "./components/ShadeShowcase/ShadeShowcase";
import Benefits from "./components/Benefits/Benefits";
import Footer from "./components/Footer/Footer";

import Product from "./pages/Product/Product";

import Cart from "./pages/Cart/Cart";

import Checkout from "./pages/Checkout/Checkout";

import Account from "./pages/Account/Account";

import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";

import Admin from "./pages/Admin/Admin";

import AdminOrders from "./pages/AdminOrders/AdminOrders";

import AdminOrderDetails from "./pages/AdminOrderDetails/AdminOrderDetails";


import Terms from "./pages/Terms/Terms";
import Privacy from "./pages/Privacy/privacy";
import RefundPolicy from "./pages/RefundPolicy/RefundPolicy";

function Home() {
  return (
    <>
      <Hero />
      <FinalCTA />
      <BrandIntro />
      <ShadeShowcase />
      <Benefits />
      <Footer />
    </>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/bag" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route
          path="/order-confirmation"
          element={<OrderConfirmation />}
        />

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/refund-policy"
          element={<RefundPolicy />}
        />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route
          path="/admin/orders/:orderId"
          element={<AdminOrderDetails />}
        />
      </Routes>
          </>
  );
}

export default App;


