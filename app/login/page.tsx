"use client";
import { useState, useEffect } from "react";
import api from "../../services/api";
import "./login.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [restaurantId, setRestaurantId] = useState("1");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [pin, setPin] = useState("");

  const router = useRouter();

  // 🔹 Cargar lista de usuarios reales desde el backend
  useEffect(() => {
    api
      .get(`/auth/staff/${restaurantId}`)
      .then((res) => {
        console.log("Usuarios del restaurante:", res.data);
        setStaffList(res.data.staff);
      })
      .catch((err) => console.error("Error cargando staff:", err));
  }, [restaurantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/staff-login", {
        restaurantId: Number(restaurantId),
        userName,
        pin,
      });

      console.log("🔍 Respuesta completa del backend:", res.data);

      const { user } = res.data;

      console.log("👤 Usuario recibido del backend:", user);

      // 🔥 GUARDAR TOKEN si existe
      if (user.access_token) {
        localStorage.setItem("token", user.access_token);
      }

      // 🔥 ADAPTADO A TU ESTRUCTURA DE MONGODB
      // Tu backend devuelve: { _id: "68c72c7e96bab6524e6714f8", name: "Martina", role: "CAJERO", restaurantId: 1 }
      const userToSave = {
        id: user._id || user.id,  // ← cashierId viene de _id de MongoDB
        _id: user._id || user.id,
        name: user.name,
        userName: userName,
        role: user.role,
        restaurantId: user.restaurantId || Number(restaurantId)
      };

      console.log("💾 Guardando usuario en localStorage:", userToSave);
      
      localStorage.setItem("user", JSON.stringify(userToSave));
      localStorage.setItem("restaurantId", (user.restaurantId || restaurantId).toString());
      
      // Verificar que se guardó correctamente
      console.log("✅ Usuario guardado, verificando...");
      console.log("localStorage.user:", localStorage.getItem("user"));
      console.log("localStorage.restaurantId:", localStorage.getItem("restaurantId"));
      
      alert(`Bienvenido ${user.name} - ${user.role}`);

      // 🔹 Redirigir según rol
      if (user.role === "CAJERO") {
        router.push("/cajero");
      } else if (user.role === "MESERO") {
        router.push("/mesero");
      } else if (user.role === "ADMIN") {
        router.push("/admin");
      }
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      console.error("❌ Error response:", error.response?.data);
      alert("Usuario o PIN incorrectos");
    }
  };

  return (
    <div className="login-container">
      <h1 style={{ marginBottom: 20, color: "#333" }}>Iniciar Sesión</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="dropdown-container">
          <select
            className="login-input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          >
            <option value="">Identifícate</option>
            {staffList.map((staff) => (
              <option key={staff.id || staff._id} value={staff.name}>
                {staff.name} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="login-input"
        />

        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>
    </div>
  );
}