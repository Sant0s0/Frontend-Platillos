"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../services/api";
import "../../mesero.css";

export default function OrderSummary() {
  const [cart, setCart] = useState<any[]>([]);
  const [mesa, setMesa] = useState<number>(1);
  const [meseroId, setMeseroId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("order_cart");
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No se encontró el token. Inicia sesión nuevamente.");
      router.push("/login");
      return;
    }

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      setMeseroId(tokenData.sub);
    } catch (error) {
      console.error("Token inválido", error);
      router.push("/login");
    }

    if (stored) setCart(JSON.parse(stored));
  }, []);

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("order_cart", JSON.stringify(updated));
  };

  const handleSendOrder = async () => {
    if (cart.length === 0) {
      alert("No hay productos en la orden");
      return;
    }

    try {
      const payload = {
      numeroMesa: mesa,
      items: cart.map((i) => ({
        menuItemId: i.menuItemId,    // 👈 usa el ID real
        cantidad: 1,
        especificaciones: "",
      })),
      meseroId,
      restaurantId: 1,
    };

      const res = await api.post("/orders", payload);
      alert(res.data.message);

      localStorage.removeItem("order_cart");
      router.push("/mesero");
    } catch (error) {
      console.error(error);
      alert("Error al enviar la orden");
    }
  };

  return (
    <div className="menu-container">
      <h1 className="menu-title">Resumen de Orden</h1>

      {cart.length === 0 ? (
        <p>No hay productos en la orden.</p>
      ) : (
        <>
          <ul className="order-list">
          {cart.map((item, idx) => (
            <li key={idx} className="order-item">
              <span className="order-item-name">
                {item.nombre}
              </span>
              <span className="order-item-price">
                ${Number(item.precio).toLocaleString("es-CO")}
              </span>
              <button onClick={() => removeItem(idx)} className="remove-btn">
                ❌
              </button>
            </li>
          ))}
        </ul>

        <div className="mesa-input-container">
          <label htmlFor="mesa">Número de mesa:</label>
          <input
            id="mesa"
            type="number"
            min="1"
            value={mesa}
            onChange={(e) => setMesa(Number(e.target.value))}
            className="mesa-input"
          />
        </div>

          <label htmlFor="mesa">Número de mesa:</label>
          <input
            id="mesa"
            type="number"
            min="1"
            value={mesa}
            onChange={(e) => setMesa(Number(e.target.value))}
            className="login-input"
          />

          <button className="menu-btn" onClick={handleSendOrder}>
            Terminar orden
          </button>
        </>
      )}

      <button className="back-button" onClick={() => router.push("/mesero/menu")}>
        Volver al menú
      </button>
    </div>
  );
}
