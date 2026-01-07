import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios";

export default function FriendStats() {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const [friend, setFriend] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFriendStats();
    }, [friendId]);

    const fetchFriendStats = async () => {
        try {
            const response = await api.get(`/friends/${friendId}/stats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setFriend(response.data.friend);
            setStats(response.data.stats);
        } catch (error) {
            console.error("Error fetching friend stats:", error);
            setError(error.response?.data?.error || "Error al cargar estadísticas");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "100px", textAlign: "center" }}>
                <h2>Cargando estadísticas...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                maxWidth: "600px", 
                margin: "100px auto", 
                padding: "40px",
                backgroundColor: "#f8d7da",
                borderRadius: "10px",
                textAlign: "center"
            }}>
                <h2 style={{ color: "#721c24" }}>❌ {error}</h2>
                <button
                    onClick={() => navigate("/friends")}
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
                    ← Volver a Amigos
                </button>
            </div>
        );
    }

    // Preparar datos para gráficos
    const topSongsData = stats.top_songs.map(item => ({
        name: item.name,
        escuchas: item.listen_count
    }));

    const topArtistsData = stats.top_artists.map(item => ({
        name: item.name,
        escuchas: item.listen_count
    }));

    return (
        <div style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px" }}>
            {/* Header con info del amigo */}
            <button
                onClick={() => navigate("/friends")}
                style={{
                    marginBottom: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#7d9d6f",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                }}
            >
                ← Volver a Amigos
            </button>

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
                <div style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "#2d5016",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "40px",
                    color: "white",
                    fontWeight: "bold"
                }}>
                    {friend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 style={{ margin: "0 0 10px 0", color: "#2d5016", fontSize: "32px" }}>
                        Estadísticas de {friend.name}
                    </h1>
                    <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
                        ✉️ {friend.email}
                    </p>
                </div>
            </div>

            {/* Métricas principales */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "30px"
            }}>
                <div style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "48px", fontWeight: "bold", color: "#2d5016", marginBottom: "10px" }}>
                        {stats.total_listens}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>
                        🎵 Escuchas Totales
                    </div>
                </div>

                <div style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "48px", fontWeight: "bold", color: "#7d9d6f", marginBottom: "10px" }}>
                        {stats.unique_songs}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>
                        🎶 Canciones Únicas
                    </div>
                </div>

                <div style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "48px", fontWeight: "bold", color: "#9cb88d", marginBottom: "10px" }}>
                        {stats.unique_artists}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>
                        🎤 Artistas Únicos
                    </div>
                </div>
            </div>

            {/* Canción y artista favoritos */}
            {stats.top_songs.length > 0 && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px"
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
                    }}>
                        <h3 style={{ margin: "0 0 20px 0", color: "#2d5016", fontSize: "18px" }}>
                            🎵 Su canción más escuchada
                        </h3>
                        <div style={{
                            backgroundColor: "#f5e6d3",
                            padding: "20px",
                            borderRadius: "8px"
                        }}>
                            <div style={{ fontWeight: "bold", fontSize: "20px", marginBottom: "8px", color: "#2d5016" }}>
                                {stats.top_songs[0].name}
                            </div>
                            <div style={{ color: "#666", fontSize: "14px" }}>
                                {stats.top_songs[0].listen_count} reproducciones
                            </div>
                        </div>
                    </div>

                    {stats.top_artists.length > 0 && (
                        <div style={{
                            backgroundColor: "white",
                            padding: "30px",
                            borderRadius: "12px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
                        }}>
                            <h3 style={{ margin: "0 0 20px 0", color: "#2d5016", fontSize: "18px" }}>
                                🎤 Su artista favorito
                            </h3>
                            <div style={{
                                backgroundColor: "#f5e6d3",
                                padding: "20px",
                                borderRadius: "8px"
                            }}>
                                <div style={{ fontWeight: "bold", fontSize: "20px", marginBottom: "8px", color: "#2d5016" }}>
                                    {stats.top_artists[0].name}
                                </div>
                                <div style={{ color: "#666", fontSize: "14px" }}>
                                    {stats.top_artists[0].listen_count} reproducciones
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Gráfico de Top Canciones */}
            {topSongsData.length > 0 && (
                <div style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "10px",
                    marginBottom: "30px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ color: "#2d5016", marginBottom: "20px" }}>
                        🎵 Top 10 Canciones de {friend.name}
                    </h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topSongsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="escuchas" fill="#2d5016" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Gráfico de Top Artistas */}
            {topArtistsData.length > 0 && (
                <div style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ color: "#2d5016", marginBottom: "20px" }}>
                        🎤 Top 10 Artistas de {friend.name}
                    </h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topArtistsData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="escuchas" fill="#7d9d6f" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Mensaje si no hay stats */}
            {stats.total_listens === 0 && (
                <div style={{
                    backgroundColor: "#fff3cd",
                    padding: "40px",
                    borderRadius: "10px",
                    textAlign: "center",
                    marginTop: "30px"
                }}>
                    <h3 style={{ color: "#856404" }}>
                        {friend.name} aún no ha registrado escuchas
                    </h3>
                </div>
            )}
        </div>
    );
}