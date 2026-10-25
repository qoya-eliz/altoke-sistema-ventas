import { useState } from 'react';
export default function useCart() {
  const [cart, setCart] = useState([]);
  const decreaseQuantity = (id_producto) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id_producto === id_producto) {
            const newQty = item.cantidad - 1;
            if (newQty <= 0) {
              return null;
            }
            return {
              ...item,
              cantidad: newQty,
              subtotal: parseFloat((newQty * item.precio_venta).toFixed(2)),
            };
          }
          return item;
        })
        .filter(Boolean),
    );
  };
  const removeFromCart = (id_producto) => {
    setCart((prevCart) => prevCart.filter((item) => item.id_producto !== id_producto));
  };
  const totalAmount = parseFloat(
    cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
  );
  const subtotalAmount = parseFloat((totalAmount / 1.18).toFixed(2));
  const igvAmount = parseFloat((totalAmount - subtotalAmount).toFixed(2));
  const totalProductsCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  return {
    cart,
    setCart,
    decreaseQuantity,
    removeFromCart,
    totalAmount,
    subtotalAmount,
    igvAmount,
    totalProductsCount,
  };
}
