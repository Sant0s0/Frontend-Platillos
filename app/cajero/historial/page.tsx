"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import "../cajero.css";

export default function CajeroHistorial() {
  const [payments, setPayments] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>("1");
  const router = useRouter();

  useEffect(() => {
    // Obtener restaurantId del localStorage o usuario actual
    const storedRestaurantId = localStorage.getItem("restaurantId") || "1";
    setRestaurantId(storedRestaurantId);
    
    loadPaymentHistory(storedRestaurantId);
  }, []);

  const loadPaymentHistory = async (restId: string) => {
    try {
      const res = await api.get(`/payments/history/${restId}`);
      setPayments(res.data.payments || []);
    } catch (error) {
      console.error("Error cargando historial:", error);
      setPayments([]);
    }
  };

  return (
    <div className="cajero-container">
      <h1 className="menu-title">Historial de Pagos</h1>

      {payments.length === 0 ? (
        <p className="no-orders">No hay pagos registrados aún.</p>
      ) : (
        <div className="orders-grid">
          {payments.map((p) => (
            <div key={p._id} className="order-card">
              <h2>Orden #{p.orderNumber || "N/A"}</h2>
              <p><strong>Método:</strong> {p.method || "N/A"}</p>
              <p><strong>Total pagado:</strong> ${p.amount?.toLocaleString("es-CO") || "0"}</p>
              <p><strong>Fecha:</strong> {p.createdAt ? new Date(p.createdAt).toLocaleString("es-CO") : "N/A"}</p>
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