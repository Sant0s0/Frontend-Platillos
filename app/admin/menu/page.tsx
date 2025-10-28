"use client";
import { useState, useEffect } from "react";
import api from "../../../services/api";
import "../../cajero/cajero.css";

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    categoria: "PLATILLOS",
  });

  useEffect(() => {
    api.get("/menu/restaurant/1").then((res) => {
      setMenuItems(res.data.menu || []);
    });
  }, []);

  const handleAddItem = async () => {
    if (!newItem.nombre || !newItem.precio) return alert("Completa todos los campos");
    await api.post("/menu", { ...newItem, precio: Number(newItem.precio), restaurantId: 1 });
    alert("Artículo creado ✅");
    setNewItem({ nombre: "", precio: "", descripcion: "", categoria: "PLATILLOS" });
    const res = await api.get("/menu/restaurant/1");
    setMenuItems(res.data.menu);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    await api.delete(`/menu/${id}`);
    alert("Artículo eliminado 🗑️");
    setMenuItems(menuItems.filter((m) => m._id !== id));
  };

  return (
    <div className="cajero-container">
      <h1 className="menu-title">Gestión de Menú</h1>

      <div className="order-card" style={{ maxWidth: 400 }}>
        <h3>➕ Agregar nuevo artículo</h3>
        <input
          placeholder="Nombre"
          className="login-input"
          value={newItem.nombre}
          onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
        />
        <input
          placeholder="Precio"
          className="login-input"
          value={newItem.precio}
          onChange={(e) => setNewItem({ ...newItem, precio: e.target.value })}
        />
        <input
          placeholder="Descripción"
          className="login-input"
          value={newItem.descripcion}
          onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
        />
        <select
          className="login-input"
          value={newItem.categoria}
          onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
        >
          <option value="ENTRADAS">ENTRADAS</option>
          <option value="PLATILLOS">PLATILLOS</option>
          <option value="DE_AUTOR">DE_AUTOR</option>
          <option value="BEBIDAS">BEBIDAS</option>
          <option value="POSTRES">POSTRES</option>
        </select>
        <button className="menu-btn" onClick={handleAddItem}>
          Guardar
        </button>
      </div>

      <h2 style={{ color: "#333", marginTop: "30px" }}>📜 Menú Actual</h2>
      <div className="orders-grid">
        {menuItems.map((item) => (
          <div key={item._id} className="order-card">
            <h3>{item.nombre}</h3>
            <p>{item.descripcion}</p>
            <p>
              <strong>Precio:</strong> ${item.precio.toLocaleString("es-CO")}
            </p>
            <p>
              <strong>Categoría:</strong> {item.categoria}
            </p>
            <button className="menu-btn" onClick={() => handleDelete(item._id)}>
              🗑️ Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
