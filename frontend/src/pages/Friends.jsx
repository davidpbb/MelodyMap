import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Friends() {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("friends"); // friends, pending, search

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await api.get("/friends", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setFriends(response.data.friends);
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await api.get("/friends/pending", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setPendingRequests(response.data.requests);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await api.get("/friends/search", {
                params: { query: searchQuery },
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setSearchResults(response.data.users);
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    const sendFriendRequest = async (friendId) => {
        try {
            await api.post("/friends/send-request", 
                { friend_id: friendId },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            alert("✅ Solicitud enviada");
            handleSearch(); // Refrescar
        } catch (error) {
            alert(error.response?.data?.error || "Error al enviar solicitud");
        }
    };

    const acceptRequest = async (friendshipId) => {
        try {
            await api.post(`/friends/accept/${friendshipId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchFriends();
            fetchPendingRequests();
            alert("✅ Solicitud aceptada");
        } catch (error) {
            alert("Error al aceptar solicitud");
        }
    };

    const rejectRequest = async (friendshipId) => {
        try {
            await api.delete(`/friends/reject/${friendshipId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchPendingRequests();
            alert("Solicitud rechazada");
        } catch (error) {
            alert("Error al rechazar solicitud");
        }
    };

    const removeFriend = async (friendId) => {
        if (!confirm("¿Eliminar este amigo?")) return;

        try {
            await api.delete(`/friends/remove/${friendId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchFriends();
            alert("Amigo eliminado");
        } catch (error) {
            alert("Error al eliminar amigo");
        }
    };

    const viewFriendStats = (friendId) => {
        navigate(`/friends/${friendId}/stats`);
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.length >= 2) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    if (loading) {
        return (
            <div style={{ padding: "100px", textAlign: "center" }}>
                <h2>Cargando...</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 20px" }}>
            <h1 style={{ marginBottom: "30px", color: "#2d5016" }}>👥 Mis Amigos</h1>

            {/* Tabs */}
            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "30px",
                borderBottom: "2px solid #e0e0e0"
            }}>
                <button
                    onClick={() => setActiveTab("friends")}
                    style={{
                        padding: "15px 30px",
                        backgroundColor: activeTab === "friends" ? "#2d5016" : "transparent",
                        color: activeTab === "friends" ? "white" : "#666",
                        border: "none",
                        borderBottom: activeTab === "friends" ? "3px solid #2d5016" : "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    Amigos ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab("pending")}
                    style={{
                        padding: "15px 30px",
                        backgroundColor: activeTab === "pending" ? "#2d5016" : "transparent",
                        color: activeTab === "pending" ? "white" : "#666",
                        border: "none",
                        borderBottom: activeTab === "pending" ? "3px solid #2d5016" : "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px",
                        position: "relative"
                    }}
                >
                    Solicitudes ({pendingRequests.length})
                    {pendingRequests.length > 0 && (
                        <span style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            backgroundColor: "#e74c3c",
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("search")}
                    style={{
                        padding: "15px 30px",
                        backgroundColor: activeTab === "search" ? "#2d5016" : "transparent",
                        color: activeTab === "search" ? "white" : "#666",
                        border: "none",
                        borderBottom: activeTab === "search" ? "3px solid #2d5016" : "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    🔍 Buscar Amigos
                </button>
            </div>

            {/* Lista de Amigos */}
            {activeTab === "friends" && (
                <div>
                    {friends.length === 0 ? (
                        <div style={{
                            backgroundColor: "#fff3cd",
                            padding: "40px",
                            borderRadius: "10px",
                            textAlign: "center"
                        }}>
                            <h3 style={{ color: "#856404" }}>Aún no tienes amigos</h3>
                            <p>Busca usuarios y envíales solicitudes de amistad</p>
                            <button
                                onClick={() => setActiveTab("search")}
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
                                🔍 Buscar Amigos
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "15px" }}>
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    style={{
                                        backgroundColor: "white",
                                        padding: "25px",
                                        borderRadius: "10px",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                        <div style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            backgroundColor: "#2d5016",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "24px",
                                            color: "white",
                                            fontWeight: "bold"
                                        }}>
                                            {friend.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>
                                                {friend.name}
                                            </h3>
                                            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                                                {friend.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => viewFriendStats(friend.id)}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#2d5016",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontSize: "14px"
                                            }}
                                        >
                                            📊 Ver Estadísticas
                                        </button>
                                        <button
                                            onClick={() => removeFriend(friend.id)}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#e74c3c",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontSize: "14px"
                                            }}
                                        >
                                            ❌ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: Solicitudes Pendientes */}
            {activeTab === "pending" && (
                <div>
                    {pendingRequests.length === 0 ? (
                        <div style={{
                            backgroundColor: "#d4edda",
                            padding: "40px",
                            borderRadius: "10px",
                            textAlign: "center",
                            color: "#155724"
                        }}>
                            <h3>No tienes solicitudes pendientes</h3>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "15px" }}>
                            {pendingRequests.map(request => (
                                <div
                                    key={request.id}
                                    style={{
                                        backgroundColor: "#fff3cd",
                                        padding: "25px",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                        <div style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            backgroundColor: "#856404",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "24px",
                                            color: "white",
                                            fontWeight: "bold"
                                        }}>
                                            {request.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>
                                                {request.user.name}
                                            </h3>
                                            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                                                {request.user.email}
                                            </p>
                                            <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
                                                Solicitud recibida: {new Date(request.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => acceptRequest(request.id)}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#27ae60",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            ✅ Aceptar
                                        </button>
                                        <button
                                            onClick={() => rejectRequest(request.id)}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#95a5a6",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontSize: "14px"
                                            }}
                                        >
                                            ❌ Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: Buscar Amigos */}
            {activeTab === "search" && (
                <div>
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        marginBottom: "30px"
                    }}>
                        <input
                            type="text"
                            placeholder="Busca por nombre o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "15px",
                                fontSize: "16px",
                                border: "2px solid #e0e0e0",
                                borderRadius: "8px"
                            }}
                        />
                    </div>

                    {searchQuery.length < 2 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#999"
                        }}>
                            Escribe al menos 2 caracteres para buscar usuarios
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div style={{
                            backgroundColor: "#f8d7da",
                            padding: "40px",
                            borderRadius: "10px",
                            textAlign: "center",
                            color: "#721c24"
                        }}>
                            No se encontraron usuarios con "{searchQuery}"
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "15px" }}>
                            {searchResults.map(user => (
                                <div
                                    key={user.id}
                                    style={{
                                        backgroundColor: "white",
                                        padding: "25px",
                                        borderRadius: "10px",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                        <div style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            backgroundColor: "#7d9d6f",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "24px",
                                            color: "white",
                                            fontWeight: "bold"
                                        }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>
                                                {user.name}
                                            </h3>
                                            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {user.friendship_status === 'accepted' ? (
                                            <span style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#d4edda",
                                                color: "#155724",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                fontWeight: "bold"
                                            }}>
                                                ✅ Ya sois amigos
                                            </span>
                                        ) : user.friendship_status === 'pending' ? (
                                            <span style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#fff3cd",
                                                color: "#856404",
                                                borderRadius: "8px",
                                                fontSize: "14px"
                                            }}>
                                                ⏳ {user.is_friend_request_sent ? 'Solicitud enviada' : 'Solicitud recibida'}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => sendFriendRequest(user.id)}
                                                style={{
                                                    padding: "10px 20px",
                                                    backgroundColor: "#2d5016",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                ➕ Añadir Amigo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}