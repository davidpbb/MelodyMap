import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState({
        start_date: '',
        end_date: ''
    });

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateFilter.start_date) params.start_date = dateFilter.start_date;
            if (dateFilter.end_date) params.end_date = dateFilter.end_date;

            const response = await api.get("/listens/statistics", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                params
            });
            setStats(response.data);
        } catch (error) {
            console.error("Error al cargar estadísticas", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    const handleFilterChange = (e) => {
        setDateFilter({
            ...dateFilter,
            [e.target.name]: e.target.value
        });
    };

    const applyFilter = () => {
        fetchStatistics();
    };

    const clearFilter = () => {
        setDateFilter({ start_date: '', end_date: '' });
        setTimeout(() => fetchStatistics(), 100);
    };

    if (loading) return (
        <div style={{ padding: "80px", textAlign: "center" }}>
            <h2>Cargando estadísticas...</h2>
        </div>
    );

    if (!stats) return (
        <div style={{ padding: "80px", textAlign: "center" }}>
            <h2>No hay datos disponibles</h2>
            <p>Comienza registrando tus escuchas para ver estadísticas</p>
        </div>
    );

    // Colores para los gráficos (tema MelodyMap)
    const COLORS = ['#2d5016', '#7d9d6f', '#f5e6d3', '#9cb88d', '#556b2f', '#8fbc8f'];

    // Preparar datos para gráfico de top canciones
    const topSongsData = stats.top_songs.map(item => ({
        name: item.song?.title || 'Desconocida',
        escuchas: item.listen_count
    }));

    // Preparar datos para gráfico de top artistas
    const topArtistsData = stats.top_artists.slice(0, 10).map(item => ({
        name: item.name,
        escuchas: item.listen_count
    }));

    // Preparar datos para gráfico mensual
    const monthlyData = stats.listens_per_month.map(item => ({
        mes: item.month,
        escuchas: item.count
    }));

    return (
        <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
            <h1 style={{ marginBottom: "30px", color: "#2d5016" }}>📊 Dashboard de Estadísticas</h1>

            {/* Filtros de fecha */}
            <div style={{ 
                backgroundColor: "#f5e6d3", 
                padding: "20px", 
                borderRadius: "10px", 
                marginBottom: "30px",
                display: "flex",
                gap: "15px",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <div>
                    <label style={{ marginRight: "10px", fontWeight: "bold" }}>Desde:</label>
                    <input 
                        type="date" 
                        name="start_date"
                        value={dateFilter.start_date}
                        onChange={handleFilterChange}
                        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                    />
                </div>
                <div>
                    <label style={{ marginRight: "10px", fontWeight: "bold" }}>Hasta:</label>
                    <input 
                        type="date" 
                        name="end_date"
                        value={dateFilter.end_date}
                        onChange={handleFilterChange}
                        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                    />
                </div>
                <button 
                    onClick={applyFilter}
                    style={{ 
                        padding: "8px 20px", 
                        backgroundColor: "#2d5016", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Aplicar Filtro
                </button>
                <button 
                    onClick={clearFilter}
                    style={{ 
                        padding: "8px 20px", 
                        backgroundColor: "#7d9d6f", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Limpiar
                </button>
            </div>

            {/* Resumen de estadísticas */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "20px", 
                marginBottom: "40px" 
            }}>
                <div style={{ 
                    backgroundColor: "#2d5016", 
                    color: "white", 
                    padding: "30px", 
                    borderRadius: "10px",
                    textAlign: "center"
                }}>
                    <h3 style={{ fontSize: "40px", margin: "0" }}>{stats.total_listens}</h3>
                    <p style={{ margin: "10px 0 0 0" }}>Total Escuchas</p>
                </div>
                <div style={{ 
                    backgroundColor: "#7d9d6f", 
                    color: "white", 
                    padding: "30px", 
                    borderRadius: "10px",
                    textAlign: "center"
                }}>
                    <h3 style={{ fontSize: "40px", margin: "0" }}>{stats.unique_songs}</h3>
                    <p style={{ margin: "10px 0 0 0" }}>Canciones Únicas</p>
                </div>
                <div style={{ 
                    backgroundColor: "#9cb88d", 
                    color: "white", 
                    padding: "30px", 
                    borderRadius: "10px",
                    textAlign: "center"
                }}>
                    <h3 style={{ fontSize: "40px", margin: "0" }}>{stats.unique_artists}</h3>
                    <p style={{ margin: "10px 0 0 0" }}>Artistas Únicos</p>
                </div>
            </div>

            {/* Gráfico: Top Canciones */}
            <div style={{ 
                backgroundColor: "white", 
                padding: "30px", 
                borderRadius: "10px", 
                marginBottom: "30px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ color: "#2d5016", marginBottom: "20px" }}>🎵 Top 10 Canciones Más Escuchadas</h2>
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

            {/* Gráfico: Top Artistas */}
            <div style={{ 
                backgroundColor: "white", 
                padding: "30px", 
                borderRadius: "10px", 
                marginBottom: "30px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ color: "#2d5016", marginBottom: "20px" }}>🎤 Top 10 Artistas Más Escuchados</h2>
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

            {/* Gráfico: Escuchas por Mes */}
            <div style={{ 
                backgroundColor: "white", 
                padding: "30px", 
                borderRadius: "10px", 
                marginBottom: "30px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ color: "#2d5016", marginBottom: "20px" }}>📈 Evolución de Escuchas (Últimos 12 Meses)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="escuchas" stroke="#2d5016" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
