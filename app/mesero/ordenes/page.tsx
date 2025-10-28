"use client";
import { useEffect, useState } from "react";
import api from "../../../services/api"
import "../mesero.css";

export default function MeseroOrdenes() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const data = JSON.parse(atob(token.split(".")[1]));
    const meseroId = data.sub;

    api.get(`/orders/mesero/${meseroId}`).then((res: any) => {
      setOrders(res.data.orders || []);
    });
  }, []);

  return (
    <div className="menu-container">
      <h1 className="menu-title">Mis Órdenes</h1>
      {orders.length === 0 ? (
        <p>No tienes órdenes activas.</p>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o._id}>
              <strong>Orden #{o.orderNumber}</strong> — Mesa {o.numeroMesa} — {o.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
