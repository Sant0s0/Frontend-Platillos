"use client";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import "../../cajero/cajero.css";

export default function AdminOrdenes() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get("/orders/history/1").then((res) => {
      setOrders(res.data.orders || []);
    });
  }, []);

  return (
    <div className="cajero-container">
      <h1 className="menu-title">Historial de Órdenes</h1>

      {orders.length === 0 ? (
        <p className="no-orders">No hay órdenes registradas aún.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <div key={o._id} className="order-card">
              <h3>Orden #{o.orderNumber}</h3>
              <p>
                <strong>Mesa:</strong> {o.numeroMesa}
              </p>
              <p>
                <strong>Mesero:</strong> {o.meseroNombre || "—"}
              </p>
              <p>
                <strong>Total:</strong> ${o.total.toLocaleString("es-CO")}
              </p>
              <p>
                <strong>Estado:</strong> {o.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}