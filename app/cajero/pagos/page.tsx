"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import "../cajero.css";

export default function CajeroPagos() {
  const [pending, setPending] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [method, setMethod] = useState("EFECTIVO");
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [restaurantId, setRestaurantId] = useState<number>(1);
  const [cajeroId, setCajeroId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Obtener restaurantId del localStorage (debe ser número)
    const storedRestaurantId = localStorage.getItem("restaurantId");
    const restId = storedRestaurantId ? parseInt(storedRestaurantId) : 1;
    setRestaurantId(restId);

    // Obtener cajeroId del usuario logueado
    const userData = localStorage.getItem("user");
    console.log("📦 Raw userData de localStorage:", userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log("👤 Usuario parseado:", user);
        
        const userId = user.id || user._id || user.userId || "";
        console.log("🆔 UserId extraído:", userId);
        
        setCajeroId(userId.toString());
        console.log("✅ CajeroId establecido:", userId.toString());
      } catch (e) {
        console.error("❌ Error parseando usuario:", e);
        alert("Error: No se pudo obtener la información del cajero. Por favor inicia sesión nuevamente.");
      }
    } else {
      console.error("❌ No hay usuario en localStorage");
      alert("Error: No has iniciado sesión. Por favor inicia sesión.");
    }
    
    loadPendingOrders(restId);

    // Si viene desde órdenes pendientes, preseleccionar la orden
    const preselected = localStorage.getItem("selectedOrder");
    if (preselected) {
      try {
        const orderData = JSON.parse(preselected);
        setSelected(orderData.orderId);
        localStorage.removeItem("selectedOrder");
      } catch (e) {
        console.error("Error parsing preselected order:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Cuando se selecciona una orden, encontrar sus detalles
    if (selected && pending.length > 0) {
      const order = pending.find(o => o._id === selected);
      setSelectedOrder(order);
      if (order && order.total) {
        setCashGiven(order.total);
      }
    }
  }, [selected, pending]);

  const loadPendingOrders = async (restId: number) => {
    try {
      const res = await api.get(`/orders/pending/${restId}`);
      setPending(res.data.orders || []);
    } catch (error) {
      console.error("Error cargando órdenes pendientes:", error);
      setPending([]);
    }
  };

  const handlePay = async () => {
    if (!selected) {
      alert("Por favor selecciona una orden");
      return;
    }

    if (!cajeroId || cajeroId === "") {
      alert("No se pudo identificar el cajero. Por favor inicia sesión nuevamente.");
      console.error("❌ cajeroId vacío:", cajeroId);
      return;
    }

    // Para EFECTIVO, validar cashGiven
    if (method === "EFECTIVO") {
      if (!cashGiven || cashGiven <= 0) {
        alert("Por favor ingresa el monto recibido en efectivo");
        return;
      }

      // Validar que el monto sea suficiente
      if (selectedOrder && cashGiven < selectedOrder.total) {
        const confirm = window.confirm(
          `El monto ingresado ($${cashGiven.toLocaleString("es-CO")}) es menor al total de la orden ($${selectedOrder.total.toLocaleString("es-CO")}). ¿Deseas continuar de todos modos?`
        );
        if (!confirm) return;
      }
    }
    
    setLoading(true);
    
    try {
      // Preparar los datos EXACTAMENTE como espera el DTO del backend
      const paymentData: any = {
        orderId: selected,
        method: method, // ← "method" no "paymentMethod"
        cajeroId: cajeroId.toString(), // ← "cajeroId" no "cashierId"
        restaurantId: restaurantId
      };

      // cashGiven solo para EFECTIVO
      if (method === "EFECTIVO") {
        paymentData.cashGiven = cashGiven;
      }

      console.log("🚀 Enviando pago:", paymentData);
      console.log("🔍 Tipos de datos:");
      console.log("  - orderId:", typeof paymentData.orderId, "→", paymentData.orderId);
      console.log("  - method:", typeof paymentData.method, "→", paymentData.method);
      console.log("  - cajeroId:", typeof paymentData.cajeroId, "→", paymentData.cajeroId);
      console.log("  - restaurantId:", typeof paymentData.restaurantId, "→", paymentData.restaurantId);
      if (method === "EFECTIVO") {
        console.log("  - cashGiven:", typeof paymentData.cashGiven, "→", paymentData.cashGiven);
      }

      const response = await api.post("/payments/process", paymentData);

      console.log("✅ Respuesta del servidor:", response.data);

      // Mostrar mensaje personalizado
      let successMessage = "Pago procesado exitosamente ✅";
      if (response.data.change) {
        successMessage += `\n${response.data.change}`;
      }
      alert(successMessage);
      
      // Limpiar el formulario
      setPending(pending.filter((p) => p._id !== selected));
      setSelected("");
      setSelectedOrder(null);
      setCashGiven(0);
      setMethod("EFECTIVO");

      // Redirigir al historial
      setTimeout(() => {
        router.push("/cajero/historial");
      }, 1000);
      
    } catch (error: any) {
      console.error("❌ Error completo:", error);
      console.error("❌ Error response:", error.response?.data);
      
      let errorMessage = "Error al procesar el pago.\n\n";
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage += error.response.data.message.join('\n');
        } else {
          errorMessage += error.response.data.message;
        }
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Por favor verifica los datos e intenta de nuevo.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cajero-container">
      <h1 className="cajero-title">Procesar Pago</h1>
      
      {!cajeroId && (
        <div style={{ 
          background: "#fff3cd", 
          padding: "15px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          border: "1px solid #ffc107"
        }}>
          <p style={{ color: "#856404", margin: 0 }}>
            ⚠️ Advertencia: No se detectó información del cajero. Por favor inicia sesión nuevamente.
          </p>
        </div>
      )}

      {pending.length === 0 ? (
        <div>
          <p className="no-orders">No hay órdenes pendientes para procesar 🎉</p>
          <button 
            className="menu-btn" 
            onClick={() => router.push("/cajero/pendientes")}
            style={{ marginTop: "20px" }}
          >
            Ver Órdenes Pendientes
          </button>
        </div>
      ) : (
        <>
          <select 
            onChange={(e) => setSelected(e.target.value)} 
            className="login-input"
            value={selected}
            disabled={loading}
          >
            <option value="">Selecciona una orden</option>
            {pending.map((p) => (
              <option key={p._id} value={p._id}>
                Orden #{p.orderNumber} — Mesa {p.numeroMesa} — Total: ${p.total?.toLocaleString("es-CO") || "0"}
              </option>
            ))}
          </select>

          {selectedOrder && (
            <div className="order-card" style={{ marginTop: "20px", marginBottom: "20px" }}>
              <h2>Detalles de la Orden #{selectedOrder.orderNumber}</h2>
              <p><strong>Mesa:</strong> {selectedOrder.numeroMesa}</p>
              <p><strong>Mesero:</strong> {selectedOrder.meseroNombre}</p>
              <ul>
                {selectedOrder.items && selectedOrder.items.map((i: any, idx: number) => (
                  <li key={idx}>
                    {i.nombreArticulo} x{i.cantidad}
                  </li>
                ))}
              </ul>
              <p><strong>Total a pagar:</strong> ${selectedOrder.total?.toLocaleString("es-CO") || "0"}</p>
            </div>
          )}

          <select 
            onChange={(e) => setMethod(e.target.value)} 
            className="login-input"
            value={method}
            disabled={loading}
          >
            <option value="EFECTIVO">💵 Efectivo</option>
            <option value="TARJETA">💳 Tarjeta</option>
          </select>

          {method === "EFECTIVO" && (
            <>
              <input
                type="number"
                placeholder="Monto recibido en efectivo"
                className="login-input"
                value={cashGiven || ""}
                onChange={(e) => setCashGiven(Number(e.target.value))}
                disabled={loading}
              />

              {selectedOrder && cashGiven > 0 && cashGiven >= selectedOrder.total && (
                <p style={{ color: "#28a745", fontWeight: "600", marginTop: "10px" }}>
                  Cambio: ${(cashGiven - selectedOrder.total).toLocaleString("es-CO")}
                </p>
              )}
            </>
          )}

          {method === "TARJETA" && (
            <p style={{ 
              background: "#e7f3ff", 
              padding: "12px", 
              borderRadius: "6px",
              color: "#004085",
              marginTop: "10px"
            }}>
              💳 Procesar pago con tarjeta. No es necesario ingresar monto.
            </p>
          )}

          <button 
            className="menu-btn" 
            onClick={handlePay}
            disabled={loading || !selected || !cajeroId || (method === "EFECTIVO" && !cashGiven)}
            style={{ 
              marginTop: "10px",
              opacity: (loading || !selected || !cajeroId || (method === "EFECTIVO" && !cashGiven)) ? 0.6 : 1,
              cursor: (loading || !selected || !cajeroId || (method === "EFECTIVO" && !cashGiven)) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Procesando..." : "💰 Confirmar Pago"}
          </button>

          <button 
            className="menu-btn" 
            onClick={() => router.push("/cajero/pendientes")}
            style={{ 
              marginTop: "10px",
              background: "#e0e0e0"
            }}
            disabled={loading}
          >
            ← Volver a Órdenes Pendientes
          </button>
        </>
      )}

      <button 
        className="menu-btn" 
        onClick={() => router.push("/cajero")}
        style={{ 
          marginTop: "20px",
          background: "#d4c5f9"
        }}
      >
        🏠 Volver al Inicio
      </button>
    </div>
  );
}