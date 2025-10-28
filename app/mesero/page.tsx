"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./mesero.css";

export default function MeseroPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "MESERO") {
      router.push("/login");
      return;
    }
    setUser(parsed);
  }, [router]);

  return (
    <div className="mesero-container">
      {user ? (
        <>
          <h1 className="mesero-title">Bienvenido {user.name}</h1>
          <p className="mesero-subtitle">Gestiona tus pedidos y atiende tus mesas</p>

          <button
            className="mesero-button"
            onClick={() => router.push("/mesero/menu")}
          >
            Nueva orden
          </button>

          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <p className="loading-text">Cargando...</p>
      )}
    </div>
  );
}
