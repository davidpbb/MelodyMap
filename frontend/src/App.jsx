import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';
import './App.css';

export default function App() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchGlobalStats();
    }
  }, [isLoggedIn]);

  const fetchGlobalStats = async () => {
    try {
      const response = await api.get("/listens/statistics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setGlobalStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Hero Section */}
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        marginBottom: "40px"
      }}>
        <h1 style={{
          fontSize: "48px",
          margin: "0 0 20px 0",
          color: "#2d5016",
          fontWeight: "bold"
        }}>
          🎵 MelodyMap
        </h1>
        <p style={{
          fontSize: "24px",
          color: "#666",
          margin: "0 0 30px 0",
          lineHeight: "1.6"
        }}>
          Descubre, analiza y comparte tus hábitos musicales
        </p>
        
        {!isLoggedIn ? (
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "15px 40px",
                backgroundColor: "#2d5016",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "15px 40px",
                backgroundColor: "#7d9d6f",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              Crear Cuenta
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: "#d4edda",
            padding: "20px",
            borderRadius: "10px",
            display: "inline-block",
            color: "#155724",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            ✅ ¡Bienvenido de vuelta!
          </div>
        )}
      </div>

      {/* Características principales */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "25px",
        marginBottom: "40px"
      }}>
        {[
          { 
            icon: "🎵", 
            title: "Registra tus Escuchas",
            desc: "Lleva un registro detallado de toda la música que escuchas",
            color: "#2d5016",
            action: isLoggedIn ? () => navigate("/registrar_escucha") : null
          },
          { 
            icon: "📊", 
            title: "Analiza tus Gustos",
            desc: "Visualiza estadísticas y descubre tus patrones musicales",
            color: "#7d9d6f",
            action: isLoggedIn ? () => navigate("/dashboard") : null
          },
          { 
            icon: "👥", 
            title: "Conecta con Amigos",
            desc: "Compara gustos musicales y descubre nueva música",
            color: "#9cb88d",
            action: isLoggedIn ? () => navigate("/friends") : null
          },
          { 
            icon: "🎤", 
            title: "Próximamente: Integración con Spotify",
            desc: "Integra Spotify para importar tus artistas favoritos",
            color: "#556b2f",
            action: null
          }
        ].map((feature, index) => (
          <div
            key={index}
            onClick={feature.action}
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              textAlign: "center",
              cursor: feature.action ? "pointer" : "default",
              transition: "all 0.3s",
              border: `3px solid ${feature.color}`
            }}
            onMouseEnter={(e) => {
              if (feature.action) {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>
              {feature.icon}
            </div>
            <h3 style={{ 
              color: feature.color, 
              margin: "0 0 10px 0",
              fontSize: "20px"
            }}>
              {feature.title}
            </h3>
            <p style={{ 
              color: "#666", 
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.5"
            }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Estadísticas del usuario (si está logueado) */}
      {isLoggedIn && globalStats && (
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          marginBottom: "40px"
        }}>
          <h2 style={{ 
            margin: "0 0 30px 0", 
            color: "#2d5016",
            textAlign: "center",
            fontSize: "28px"
          }}>
            📈 Tu Actividad Musical
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px"
          }}>
            <div style={{
              backgroundColor: "#f5e6d3",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <div style={{ 
                fontSize: "36px", 
                fontWeight: "bold", 
                color: "#2d5016",
                marginBottom: "8px"
              }}>
                {globalStats.total_listens}
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                Escuchas
              </div>
            </div>
            <div style={{
              backgroundColor: "#f5e6d3",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <div style={{ 
                fontSize: "36px", 
                fontWeight: "bold", 
                color: "#7d9d6f",
                marginBottom: "8px"
              }}>
                {globalStats.unique_songs}
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                Canciones
              </div>
            </div>
            <div style={{
              backgroundColor: "#f5e6d3",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <div style={{ 
                fontSize: "36px", 
                fontWeight: "bold", 
                color: "#9cb88d",
                marginBottom: "8px"
              }}>
                {globalStats.unique_artists}
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                Artistas
              </div>
            </div>
          </div>

          {/* Top canción y artista */}
          {globalStats.top_songs.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginTop: "30px"
            }}>
              <div style={{
                backgroundColor: "#d4edda",
                padding: "20px",
                borderRadius: "12px"
              }}>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#155724",
                  fontWeight: "bold",
                  marginBottom: "10px"
                }}>
                  🎵 CANCIÓN FAVORITA
                </div>
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "bold",
                  color: "#2d5016"
                }}>
                  {globalStats.top_songs[0].name}
                </div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
                  {globalStats.top_songs[0].listen_count} reproducciones
                </div>
              </div>

              {globalStats.top_artists.length > 0 && (
                <div style={{
                  backgroundColor: "#fff3cd",
                  padding: "20px",
                  borderRadius: "12px"
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#856404",
                    fontWeight: "bold",
                    marginBottom: "10px"
                  }}>
                    🎤 ARTISTA FAVORITO
                  </div>
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "bold",
                    color: "#2d5016"
                  }}>
                    {globalStats.top_artists[0].name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
                    {globalStats.top_artists[0].listen_count} reproducciones
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Acciones rápidas (si está logueado) */}
      {isLoggedIn && (
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            margin: "0 0 25px 0", 
            color: "#2d5016",
            textAlign: "center",
            fontSize: "24px"
          }}>
            ⚡ Acciones Rápidas
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}>
            {[
              { label: "➕ Registrar Escucha", path: "/registrar_escucha", color: "#2d5016" },
              { label: "📊 Ver Dashboard", path: "/dashboard", color: "#7d9d6f" },
              { label: "👥 Mis Amigos", path: "/friends", color: "#9cb88d" },
              { label: "👤 Mi Perfil", path: "/profile", color: "#556b2f" }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                style={{
                  padding: "18px",
                  backgroundColor: action.color,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div style={{
        marginTop: "60px",
        padding: "30px",
        backgroundColor: "#f8f9fa",
        borderRadius: "15px",
        textAlign: "center"
      }}>
        <h3 style={{ 
          color: "#2d5016", 
          margin: "0 0 15px 0",
          fontSize: "20px"
        }}>
          ¿Por qué MelodyMap?
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "20px"
        }}>
          {[
            { emoji: "📱", text: "Fácil de usar" },
            { emoji: "🔒", text: "100% privado y seguro" },
            { emoji: "📈", text: "Estadísticas detalladas" },
            { emoji: "🆓", text: "Completamente gratis" }
          ].map((item, index) => (
            <div key={index} style={{ fontSize: "14px", color: "#666" }}>
              <div style={{ fontSize: "30px", marginBottom: "8px" }}>{item.emoji}</div>
              <strong>{item.text}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final si no está logueado */}
      {!isLoggedIn && (
        <div style={{
          marginTop: "40px",
          padding: "40px",
          backgroundColor: "#2d5016",
          borderRadius: "15px",
          textAlign: "center",
          color: "white"
        }}>
          <h2 style={{ 
            margin: "0 0 15px 0",
            fontSize: "28px"
          }}>
            ¿Listo para comenzar?
          </h2>
          <p style={{ 
            margin: "0 0 25px 0",
            fontSize: "16px",
            opacity: 0.9
          }}>
            Únete a MelodyMap y descubre tus hábitos musicales
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "15px 50px",
              backgroundColor: "white",
              color: "#2d5016",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            Empezar Ahora →
          </button>
        </div>
      )}
    </div>
  );
}