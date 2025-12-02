import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Perfil() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    if (localStorage.getItem("token") === null) return <p>No has iniciado sesión!</p>

    useEffect(() => {
        api.get(`/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
            .then(response => {
                setUser(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al cargar usuario", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Cargando...</p>;
    if (!user) return <p>No se encontró el usuario.</p>;

    return (
        <div>
            <h1>Perfil</h1>

            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
        </div>
    );
}
