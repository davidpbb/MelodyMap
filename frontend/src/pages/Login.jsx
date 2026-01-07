import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true); // true = login, false = register
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: ""
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null); // Limpiar error al escribir
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post("/login", {
                email: formData.email,
                password: formData.password
            });
            localStorage.setItem("token", response.data.access_token);
            window.location.href = "/";
        } catch (err) {
            setError(err.response?.data?.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.password_confirmation) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });
            localStorage.setItem("token", response.data.access_token);
            window.location.href = "/";
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <div style={{
                maxWidth: "450px",
                width: "100%",
                backgroundColor: "white",
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                overflow: "hidden"
            }}>
                {/* Header con logo */}
                <div style={{
                    backgroundColor: "#2d5016",
                    padding: "40px 30px",
                    textAlign: "center",
                    color: "white"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "10px" }}>
                        🎵
                    </div>
                    <h1 style={{ 
                        margin: "0 0 8px 0", 
                        fontSize: "32px",
                        fontWeight: "bold"
                    }}>
                        MelodyMap
                    </h1>
                    <p style={{ 
                        margin: 0, 
                        opacity: 0.9,
                        fontSize: "14px"
                    }}>
                        Tu diario musical personal
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    borderBottom: "2px solid #e0e0e0"
                }}>
                    <button
                        onClick={() => {
                            setIsLogin(true);
                            setError(null);
                            setFormData({ name: "", email: "", password: "", password_confirmation: "" });
                        }}
                        style={{
                            flex: 1,
                            padding: "18px",
                            backgroundColor: isLogin ? "#f5e6d3" : "transparent",
                            color: isLogin ? "#2d5016" : "#999",
                            border: "none",
                            borderBottom: isLogin ? "3px solid #2d5016" : "none",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "all 0.3s"
                        }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => {
                            setIsLogin(false);
                            setError(null);
                            setFormData({ name: "", email: "", password: "", password_confirmation: "" });
                        }}
                        style={{
                            flex: 1,
                            padding: "18px",
                            backgroundColor: !isLogin ? "#f5e6d3" : "transparent",
                            color: !isLogin ? "#2d5016" : "#999",
                            border: "none",
                            borderBottom: !isLogin ? "3px solid #2d5016" : "none",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "all 0.3s"
                        }}
                    >
                        Registrarse
                    </button>
                </div>

                {/* Formularios */}
                <div style={{ padding: "40px 30px" }}>
                    {isLogin ? (
                        // LOGIN
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: "25px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#2d5016",
                                    fontWeight: "bold",
                                    fontSize: "14px"
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="tu@email.com"
                                    style={{
                                        width: "100%",
                                        padding: "14px",
                                        fontSize: "16px",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "10px",
                                        transition: "border 0.3s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#2d5016"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>

                            <div style={{ marginBottom: "30px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#2d5016",
                                    fontWeight: "bold",
                                    fontSize: "14px"
                                }}>
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    style={{
                                        width: "100%",
                                        padding: "14px",
                                        fontSize: "16px",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "10px",
                                        transition: "border 0.3s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#2d5016"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    padding: "12px",
                                    backgroundColor: "#f8d7da",
                                    color: "#721c24",
                                    borderRadius: "8px",
                                    marginBottom: "20px",
                                    fontSize: "14px",
                                    textAlign: "center"
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    backgroundColor: loading ? "#999" : "#2d5016",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.3s",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) e.target.style.backgroundColor = "#1f3d0f";
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) e.target.style.backgroundColor = "#2d5016";
                                }}
                            >
                                {loading ? "Entrando..." : "Iniciar Sesión"}
                            </button>
                        </form>
                    ) : (
                        // REGISTRO
                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#2d5016",
                                    fontWeight: "bold",
                                    fontSize: "14px"
                                }}>
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Tu nombre"
                                    style={{
                                        width: "100%",
                                        padding: "14px",
                                        fontSize: "16px",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "10px",
                                        transition: "border 0.3s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#2d5016"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#2d5016",
                                    fontWeight: "bold",
                                    fontSize: "14px"
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="tu@email.com"
                                    style={{
                                        width: "100%",
                                        padding: "14px",
                                        fontSize: "16px",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "10px",
                                        transition: "border 0.3s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#2d5016"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#2d5016",
                                    fontWeight: "bold",
                                    fontSize: "14px"
                                }}>
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                    minLength={8}
                                    style={{
                                        width: "100%",
                                        padding: "14px",
                                        fontSize: "16px",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "10px",
                                        transition: "border 0.3s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#2d5016"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>

                            <div style={{ marginBottom: "25px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#2d5016",
                                    fontWeight: "bold",
                                    fontSize: "14px"
                                }}>
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                    placeholder="Repite tu contraseña"
                                    minLength={8}
                                    style={{
                                        width: "100%",
                                        padding: "14px",
                                        fontSize: "16px",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "10px",
                                        transition: "border 0.3s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#2d5016"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    padding: "12px",
                                    backgroundColor: "#f8d7da",
                                    color: "#721c24",
                                    borderRadius: "8px",
                                    marginBottom: "20px",
                                    fontSize: "14px",
                                    textAlign: "center"
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    backgroundColor: loading ? "#999" : "#2d5016",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.3s",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) e.target.style.backgroundColor = "#1f3d0f";
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) e.target.style.backgroundColor = "#2d5016";
                                }}
                            >
                                {loading ? "Registrando..." : "Crear Cuenta"}
                            </button>
                        </form>
                    )}

                    {/* Link para volver */}
                    <div style={{
                        marginTop: "30px",
                        textAlign: "center"
                    }}>
                        <button
                            onClick={() => navigate("/")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#7d9d6f",
                                cursor: "pointer",
                                fontSize: "14px",
                                textDecoration: "underline"
                            }}
                        >
                            ← Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}