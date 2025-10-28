"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import "../cajero.css";

export default function CajeroPendientes() {
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>("1");
  const router = useRouter();

  useEffect(() => {
    // Obtener restaurantId del localStorage o usuario actual
    const storedRestaurantId = localStorage.getItem("restaurantId") || "1";
    setRestaurantId(storedRestaurantId);
    
    loadOrders(storedRestaurantId);
  }, []);

  const loadOrders = async (restId: string) => {
    try {
      const res = await api.get(`/orders/pending/${restId}`);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      setOrders([]);
    }
  };

  const handleProcessPayment = (orderId: string, orderNumber: number, mesa: number) => {
    // Guardar la orden seleccionada en localStorage para usarla en la página de pagos
    localStorage.setItem("selectedOrder", JSON.stringify({
      orderId,
      orderNumber,
      mesa
    }));
    router.push("/cajero/pagos");
  };

  return (
    <div className="cajero-container">
      <h1 className="menu-title">Órdenes Pendientes</h1>

      {orders.length === 0 ? (
        <p className="no-orders">No hay órdenes pendientes 🎉</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <div key={o._id} className="order-card">
              <h2>Orden #{o.orderNumber}</h2>
              <p><strong>Mesa:</strong> {o.numeroMesa}</p>
              <p><strong>Mesero:</strong> {o.meseroNombre}</p>
              <ul>
                {o.items.map((i: any, idx: number) => (
                  <li key={idx}>{i.nombreArticulo} x{i.cantidad}</li>
                ))}
              </ul>
              <p><strong>Total:</strong> ${o.total?.toLocaleString("es-CO") || "0"}</p>
              <button 
                className="menu-btn" 
                onClick={() => handleProcessPayment(o._id, o.orderNumber, o.numeroMesa)}
              >
                💳 Procesar Pago
              </button>
            </div>
          ))}
        </div>
      )}

      <button 
        className="menu-btn" 
        onClick={() => router.push("/cajero")}
        style={{ marginTop: "30px" }}
      >
        🏠 Volver al Inicio
      </button>
    </div>
  );
}