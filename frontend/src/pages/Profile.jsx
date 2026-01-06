import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    if (localStorage.getItem("token") === null) {
        return (
            <div style={{ 
                maxWidth: "600px", 
                margin: "100px auto", 
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#fff3cd",
                borderRadius: "10px"
            }}>
                <h2 style={{ color: "#856404" }}>⚠️ No has iniciado sesión</h2>
                <p>Por favor, inicia sesión para ver tu perfil.</p>
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: "20px",
                        padding: "12px 30px",
                        backgroundColor: "#2d5016",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    Ir a Login
                </button>
            </div>
        );
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener datos del usuario
                const userResponse = await api.get(`/profile`, { 
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
                });
                setUser(userResponse.data);

                // Obtener estadísticas del usuario
                const statsResponse = await api.get(`/listens/statistics`, { 
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
                });
                setStats(statsResponse.data);

                setLoading(false);
            } catch (error) {
                console.error("Error al cargar datos", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ 
                maxWidth: "900px", 
                margin: "100px auto", 
                textAlign: "center",
                fontSize: "18px",
                color: "#666"
            }}>
                <div style={{ fontSize: "40px", marginBottom: "20px" }}>🎵</div>
                Cargando tu perfil...
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ 
                maxWidth: "600px", 
                margin: "100px auto", 
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#f8d7da",
                borderRadius: "10px"
            }}>
                <h2 style={{ color: "#721c24" }}>❌ Error</h2>
                <p>No se pudo cargar la información del usuario.</p>
            </div>
        );
    }

    // Calcular fecha de registro
    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Fecha no disponible';

    return (
        <div style={{ 
            maxWidth: "1000px", 
            margin: "60px auto", 
            padding: "0 20px" 
        }}>
            {/* Header del perfil */}
            <div style={{
                backgroundColor: "white",
                padding: "40px",
                borderRadius: "15px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "30px"
            }}>
                {/* Avatar */}
                <div style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    backgroundColor: "#2d5016",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    color: "white",
                    fontWeight: "bold",
                    flexShrink: 0
                }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Información del usuario */}
                <div style={{ flex: 1 }}>
                    <h1 style={{ 
                        margin: "0 0 10px 0", 
                        color: "#2d5016",
                        fontSize: "32px"
                    }}>
                        {user.name}
                    </h1>
                    <p style={{ 
                        margin: "0 0 15px 0", 
                        color: "#666",
                        fontSize: "16px"
                    }}>
                        ✉️ {user.email}
                    </p>
                    <div style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        backgroundColor: "#f5e6d3",
                        borderRadius: "20px",
                        fontSize: "14px",
                        color: "#2d5016"
                    }}>
                        📅 Miembro desde {memberSince}
                    </div>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            {stats && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px"
                }}>
                    {/* Total de escuchas */}
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: "48px", 
                            fontWeight: "bold", 
                            color: "#2d5016",
                            marginBottom: "10px"
                        }}>
                            {stats.total_listens || 0}
                        </div>
                        <div style={{ 
                            fontSize: "14px", 
                            color: "#666",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            🎵 Escuchas Totales
                        </div>
                    </div>

                    {/* Canciones únicas */}
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: "48px", 
                            fontWeight: "bold", 
                            color: "#7d9d6f",
                            marginBottom: "10px"
                        }}>
                            {stats.unique_songs || 0}
                        </div>
                        <div style={{ 
                            fontSize: "14px", 
                            color: "#666",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            🎶 Canciones Únicas
                        </div>
                    </div>

                    {/* Artistas únicos */}
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: "48px", 
                            fontWeight: "bold", 
                            color: "#9cb88d",
                            marginBottom: "10px"
                        }}>
                            {stats.unique_artists || 0}
                        </div>
                        <div style={{ 
                            fontSize: "14px", 
                            color: "#666",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            🎤 Artistas Únicos
                        </div>
                    </div>
                </div>
            )}

            {/* Canción favorita y artista favorito */}
            {stats && stats.top_songs && stats.top_songs.length > 0 && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px"
                }}>
                    {/* Canción más escuchada */}
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
                    }}>
                        <h3 style={{ 
                            margin: "0 0 20px 0",
                            color: "#2d5016",
                            fontSize: "18px"
                        }}>
                            🎵 Tu canción más escuchada
                        </h3>
                        <div style={{
                            backgroundColor: "#f5e6d3",
                            padding: "20px",
                            borderRadius: "8px"
                        }}>
                            <div style={{ 
                                fontWeight: "bold",
                                fontSize: "20px",
                                marginBottom: "8px",
                                color: "#2d5016"
                            }}>
                                {stats.top_songs[0].name}
                            </div>
                            <div style={{ 
                                color: "#666",
                                fontSize: "14px"
                            }}>
                                {stats.top_songs[0].listen_count} reproducciones
                            </div>
                        </div>
                    </div>

                    {/* Artista favorito */}
                    {stats.top_artists && stats.top_artists.length > 0 && (
                        <div style={{
                            backgroundColor: "white",
                            padding: "30px",
                            borderRadius: "12px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
                        }}>
                            <h3 style={{ 
                                margin: "0 0 20px 0",
                                color: "#2d5016",
                                fontSize: "18px"
                            }}>
                                🎤 Tu artista favorito
                            </h3>
                            <div style={{
                                backgroundColor: "#f5e6d3",
                                padding: "20px",
                                borderRadius: "8px"
                            }}>
                                <div style={{ 
                                    fontWeight: "bold",
                                    fontSize: "20px",
                                    marginBottom: "8px",
                                    color: "#2d5016"
                                }}>
                                    {stats.top_artists[0].name}
                                </div>
                                <div style={{ 
                                    color: "#666",
                                    fontSize: "14px"
                                }}>
                                    {stats.top_artists[0].listen_count} reproducciones
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Acciones rápidas */}
            <div style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
            }}>
                <h3 style={{ 
                    margin: "0 0 20px 0",
                    color: "#2d5016",
                    fontSize: "20px"
                }}>
                    🚀 Acciones Rápidas
                </h3>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px"
                }}>
                    <button
                        onClick={() => navigate("/registrar_escucha")}
                        style={{
                            padding: "20px",
                            backgroundColor: "#2d5016",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "bold",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                        ➕ Registrar Escucha
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            padding: "20px",
                            backgroundColor: "#7d9d6f",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "bold",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                        📊 Ver Dashboard
                    </button>

                    <button
                        onClick={() => navigate("/spotify")}
                        style={{
                            padding: "20px",
                            backgroundColor: "#1DB954",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "bold",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                        🎵 Conectar Spotify
                    </button>
                </div>
            </div>

            {/* Información de cuenta */}
            <div style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                marginTop: "30px"
            }}>
                <h3 style={{ 
                    margin: "0 0 20px 0",
                    color: "#2d5016",
                    fontSize: "20px"
                }}>
                    ℹ️ Información de la Cuenta
                </h3>
                <div style={{ display: "grid", gap: "15px" }}>
                    <div style={{
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ color: "#666" }}>ID de Usuario:</span>
                        <span style={{ fontWeight: "bold", color: "#2d5016" }}>#{user.id}</span>
                    </div>
                    <div style={{
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ color: "#666" }}>Nombre:</span>
                        <span style={{ fontWeight: "bold" }}>{user.name}</span>
                    </div>
                    <div style={{
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ color: "#666" }}>Email:</span>
                        <span style={{ fontWeight: "bold" }}>{user.email}</span>
                    </div>
                    {user.email_verified_at && (
                        <div style={{
                            padding: "15px",
                            backgroundColor: "#d4edda",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span style={{ color: "#155724" }}>Estado de Email:</span>
                            <span style={{ fontWeight: "bold", color: "#155724" }}>✅ Verificado</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}