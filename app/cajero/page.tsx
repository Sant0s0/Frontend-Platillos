"use client";
import { useRouter } from "next/navigation";
import "./cajero.css";

export default function CajeroMain() {
  const router = useRouter();

  return (
    <div className="cajero-container">
      <h1 className="menu-title">Panel del Cajero</h1>
      <div className="options-grid">
        <button onClick={() => router.push("/cajero/pendientes")} className="menu-btn">
          🧾 Órdenes Pendientes
        </button>
        <button onClick={() => router.push("/cajero/pagos")} className="menu-btn">
          💳 Procesar Pagos
        </button>
        <button onClick={() => router.push("/cajero/historial")} className="menu-btn">
          🕒 Historial de Pagos
        </button>
      </div>
    </div>
  );
}