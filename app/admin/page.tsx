"use client";
import { useRouter } from "next/navigation";
import "../cajero/cajero.css"; // reutilizamos los tonos lavanda y gris

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="cajero-container">
      <h1 className="menu-title">Panel del Administrador</h1>
      <p style={{ color: "#555", marginBottom: "20px" }}>
        Selecciona una de las secciones para administrar el restaurante.
      </p>

      <div className="options-grid">
        <button className="menu-btn" onClick={() => router.push("/admin/menu")}>
          🍽️ Gestionar Menú
        </button>
        <button className="menu-btn" onClick={() => router.push("/admin/ordenes")}>
          🧾 Ver Órdenes
        </button>
        <button className="menu-btn" onClick={() => router.push("/admin/estadisticas")}>
          📊 Estadísticas
        </button>
      </div>
    </div>
  );
}