import { useState } from "react";
import api from "../api/axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post("/login", {
              
                email: email,
                password: password
            });
            localStorage.setItem("token", response.data.access_token);
            window.location.href = "/profile";
        } catch (err) {
            setError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "80px" }}>
            <h1 style={{ marginBottom: "20px" }}>Iniciar sesión</h1>

            <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: "15px" }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", padding: "10px" }}
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}
