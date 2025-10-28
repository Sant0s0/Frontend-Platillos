"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import "../admin.css";

interface ProductStat {
  id: string;
  nombre: string;
  cantidadVendida: number;
  totalVentas: number;
}

interface PaymentMethodStat {
  count: number;
  amount: number;
  percentage: number;
}

interface Stats {
  totalPayments: number;
  totalAmount: number;
  cash: PaymentMethodStat;
  card: PaymentMethodStat;
  totalOrdersCompleted: number;
  totalRevenue: number;
  productStats: ProductStat[];
  mostSoldProduct: ProductStat | null;
  leastSoldProduct: ProductStat | null;
}

export default function AdminEstadisticas() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<number>(1);
  const router = useRouter();

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("restaurantId");
    const restId = storedRestaurantId ? parseInt(storedRestaurantId) : 1;
    setRestaurantId(restId);
    
    loadStats(restId);
  }, []);

  const loadStats = async (restId: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/payments/stats/${restId}`);
      
      console.log("📊 Estadísticas recibidas:", res.data);
      
      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para formatear números de forma segura
  const formatCurrency = (value: number | undefined | null): string => {
    const numValue = Number(value) || 0;
    return numValue.toLocaleString("es-CO");
  };

  const formatNumber = (value: number | undefined | null): string => {
    const numValue = Number(value) || 0;
    return numValue.toString();
  };

  // Calcular ticket promedio
  const averageTicket = stats && stats.totalOrdersCompleted > 0 
    ? stats.totalRevenue / stats.totalOrdersCompleted 
    : 0;

  if (loading) {
    return (
      <div className="admin-container">
        <h1 className="admin-title">📊 Estadísticas del Restaurante</h1>
        <p style={{ color: "#666", marginTop: "20px" }}>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-container">
        <h1 className="admin-title">📊 Estadísticas del Restaurante</h1>
        <p className="no-orders">No hay estadísticas disponibles</p>
        <button 
          className="menu-btn" 
          onClick={() => router.push("/admin")}
          style={{ marginTop: "20px" }}
        >
          🏠 Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Estadísticas del Restaurante</h1>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="orders-grid" style={{ marginBottom: "40px" }}>
        <div className="order-card" style={{ minWidth: "250px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>💰 Ingresos Totales</h3>
          <p style={{ fontSize: "32px", fontWeight: "700", color: "#28a745", margin: "10px 0" }}>
            ${formatCurrency(stats.totalRevenue)}
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            {formatNumber(stats.totalPayments)} pagos procesados
          </p>
        </div>

        <div className="order-card" style={{ minWidth: "250px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>🧾 Órdenes Completadas</h3>
          <p style={{ fontSize: "32px", fontWeight: "700", color: "#007bff", margin: "10px 0" }}>
            {formatNumber(stats.totalOrdersCompleted)}
          </p>
        </div>

        <div className="order-card" style={{ minWidth: "250px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>📈 Ticket Promedio</h3>
          <p style={{ fontSize: "32px", fontWeight: "700", color: "#ff9800", margin: "10px 0" }}>
            ${formatCurrency(averageTicket)}
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Por orden
          </p>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="orders-grid" style={{ marginBottom: "40px" }}>
        <div className="order-card" style={{ minWidth: "280px", background: "#e8f5e9" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "#2e7d32" }}>
            💵 Pagos en Efectivo
          </h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#1b5e20", margin: "10px 0" }}>
            ${formatCurrency(stats.cash.amount)}
          </p>
          <p style={{ fontSize: "14px", color: "#388e3c" }}>
            {stats.cash.count} pagos ({stats.cash.percentage}%)
          </p>
        </div>

        <div className="order-card" style={{ minWidth: "280px", background: "#f3e5f5" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "#6a1b9a" }}>
            💳 Pagos con Tarjeta
          </h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#4a148c", margin: "10px 0" }}>
            ${formatCurrency(stats.card.amount)}
          </p>
          <p style={{ fontSize: "14px", color: "#7b1fa2" }}>
            {stats.card.count} pagos ({stats.card.percentage}%)
          </p>
        </div>
      </div>

      {/* Productos Más y Menos Vendidos */}
      <div className="orders-grid" style={{ marginBottom: "40px" }}>
        {stats.mostSoldProduct && (
          <div className="order-card" style={{ minWidth: "300px", background: "#fff9c4" }}>
            <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "#f57f17" }}>
              🏆 Producto Más Vendido
            </h3>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#f57f17", margin: "8px 0" }}>
              {stats.mostSoldProduct.nombre}
            </p>
            <p style={{ fontSize: "16px", color: "#f9a825" }}>
              🔢 {formatNumber(stats.mostSoldProduct.cantidadVendida)} unidades vendidas
            </p>
            <p style={{ fontSize: "16px", color: "#f9a825" }}>
              💰 Total: ${formatCurrency(stats.mostSoldProduct.totalVentas)}
            </p>
          </div>
        )}

        {stats.leastSoldProduct && (
          <div className="order-card" style={{ minWidth: "300px", background: "#e1f5fe" }}>
            <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "#01579b" }}>
              📉 Producto Menos Vendido
            </h3>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#01579b", margin: "8px 0" }}>
              {stats.leastSoldProduct.nombre}
            </p>
            <p style={{ fontSize: "16px", color: "#0277bd" }}>
              🔢 {formatNumber(stats.leastSoldProduct.cantidadVendida)} unidades vendidas
            </p>
            <p style={{ fontSize: "16px", color: "#0277bd" }}>
              💰 Total: ${formatCurrency(stats.leastSoldProduct.totalVentas)}
            </p>
          </div>
        )}
      </div>

      {/* Tabla de Productos */}
      {stats.productStats && stats.productStats.length > 0 && (
        <div style={{ width: "100%", maxWidth: "1200px", marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
            📋 Ranking de Productos (Ordenados por Ventas)
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              background: "white",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}>
              <thead style={{ background: "#cdbdf6" }}>
                <tr>
                  <th style={{ padding: "15px", textAlign: "center", color: "#111", fontWeight: "700", width: "60px" }}>
                    Pos.
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", color: "#111", fontWeight: "700" }}>
                    Producto
                  </th>
                  <th style={{ padding: "15px", textAlign: "center", color: "#111", fontWeight: "700" }}>
                    Unidades
                  </th>
                  <th style={{ padding: "15px", textAlign: "right", color: "#111", fontWeight: "700" }}>
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.productStats.map((product, index) => (
                  <tr 
                    key={product.id}
                    style={{ 
                      borderBottom: "1px solid #f0f0f0",
                      background: index % 2 === 0 ? "#fafafa" : "white"
                    }}
                  >
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "#666",
                      fontWeight: "700",
                      fontSize: "16px"
                    }}>
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && (index + 1)}
                    </td>
                    <td style={{ padding: "12px", color: "#111", fontWeight: "600" }}>
                      {product.nombre}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", color: "#111", fontSize: "16px" }}>
                      {formatNumber(product.cantidadVendida)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#28a745", fontWeight: "600" }}>
                      ${formatCurrency(product.totalVentas)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: "#f5f5f5", fontWeight: "700" }}>
                <tr>
                  <td colSpan={2} style={{ padding: "15px", color: "#111" }}>
                    TOTAL
                  </td>
                  <td style={{ padding: "15px", textAlign: "center", color: "#111" }}>
                    {stats.productStats.reduce((sum, p) => sum + p.cantidadVendida, 0)}
                  </td>
                  <td style={{ padding: "15px", textAlign: "right", color: "#28a745", fontSize: "18px" }}>
                    ${formatCurrency(stats.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Botón de Volver */}
      <button 
        className="menu-btn" 
        onClick={() => router.push("/admin")}
        style={{ marginTop: "20px" }}
      >
        🏠 Volver al Inicio
      </button>
    </div>
  );
}