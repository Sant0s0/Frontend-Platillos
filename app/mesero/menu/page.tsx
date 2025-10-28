"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import "../mesero.css";

interface MenuItem {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  restaurantId: number;
  image?: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  // 🔹 Cargar menú desde backend
  useEffect(() => {
    api
      .get("/menu/restaurant/1")
      .then((res) => {
        const items = Array.isArray(res.data?.menu)
          ? res.data.menu
          : Array.isArray(res.data)
          ? res.data
          : [];

        // Filtra productos solo del restaurante 1
        const filtered = items.filter((i:any) => i.restaurantId === 1);
        setMenuItems(filtered);
      })
      .catch((err) => {
        console.error("❌ Error cargando menú:", err);
        setMenuItems([]);
      });
  }, []);

  // 🔹 Sincronizar carrito con localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("order_cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // 🔹 Agregar ítem al carrito
  const handleAddToCart = (item: MenuItem) => {
    const newItem = {
      menuItemId: item._id,
      nombre: item.nombre,
      precio: item.precio,
      categoria: item.categoria,
    };

    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem("order_cart", JSON.stringify(updatedCart));

    alert(`${item.nombre} agregado al pedido`);
  };

  // 🔹 Ver resumen del pedido
  const handleViewCart = () => {
    router.push("/mesero/menu/order-summary");
  };

  // Orden de categorías según tu enum
  const order = ["ENTRADAS", "PLATILLOS", "DE_AUTOR", "BEBIDAS", "POSTRES"];

  // Agrupar productos por categoría
  const groupedMenu = order.reduce<Record<string, MenuItem[]>>((acc, category) => {
    acc[category] = menuItems.filter((item) => item.categoria === category);
    return acc;
  }, {});

  return (
    
    <div className="menu-container">
      <h1 className="menu-title">Menú del Restaurante</h1>

      {order.map((category) => (
        <div key={category} className="menu-section">
          <h2 className="menu-section-header">--- {category} ---</h2>

          <div className="menu-grid">
            {groupedMenu[category] && groupedMenu[category].length > 0 ? (
              groupedMenu[category].map((item) => (
                <div key={item._id} className="menu-card">
                  <div className="menu-img">
                    {item.image ? (
                      <img
                        src={`/images/${item.categoria.toLowerCase()}/${item.image}`}
                        alt={item.nombre}
                        className="menu-image"
                      />
                    ) : (
                      <p>📸 Imagen no disponible</p>
                    )}
                  </div>
                  <h3 className="menu-section-title">{item.nombre}</h3>
                  <p className="menu-item-desc">{item.descripcion}</p>
                  <p style={{ color: "#555", fontWeight: 500 }}>
                    ${Number(item.precio).toLocaleString("es-CO")}
                  </p>
                  <button
                    className="menu-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    Agregar
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: "#888", textAlign: "center", width: "100%" }}>
                No hay productos en esta categoría para este restaurante.
              </p>
            )}
          </div>
        </div>
      ))}
      
      {cart.length > 0 && (
        <button className="cart-button" onClick={handleViewCart}>
          🧾 Ver orden ({cart.length})
        </button>
      )}

      <button className="back-button" onClick={() => router.push("/mesero")}>
        ⬅️ Volver
      </button>

      <button className="menu-btn" onClick={() => router.push("/mesero/ordenes")}>
          📋 Ver Mis Órdenes
        </button>
      </div>

      
      
    
    
  );
}

