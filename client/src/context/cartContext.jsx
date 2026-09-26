import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem("ceresea-cart");

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    } catch {
      return [];
    }
  });

  /* =======================================================
     SAVE CART
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "ceresea-cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = (
    product,
    shade,
    quantity
  ) => {
    setCartItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            item.productId === product.id &&
            item.shadeId === shade.id
        );

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.id &&
          item.shadeId === shade.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,

          shadeId: shade.id,
          shadeName: shade.name,
          shadeColor: shade.color,
          image: shade.image,

          quantity,
        },
      ];
    });
  };

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = (
    productId,
    shadeId,
    quantity
  ) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId &&
        item.shadeId === shadeId
          ? {
              ...item,
              quantity: Math.max(
                1,
                quantity
              ),
            }
          : item
      )
    );
  };

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const removeFromCart = (
    productId,
    shadeId
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.shadeId === shadeId
          )
      )
    );
  };

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart = () => {
    // Clear localStorage immediately.
    // This prevents old cart items from
    // returning after a payment/refresh.
    localStorage.setItem(
      "ceresea-cart",
      "[]"
    );

    setCartItems([]);
  };

  /* =======================================================
     TOTAL ITEMS
  ======================================================= */

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  /* =======================================================
     TOTAL PRICE
  ======================================================= */

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,

        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================================================
   CUSTOM HOOK
========================================================= */

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}