import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "../components/Modal.jsx";

export default function RegistrarEscucha() {
    const fechaHoraActual = new Date();
    fechaHoraActual.setHours(fechaHoraActual.getHours() + 1);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [artists, setArtists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);
    const [listenDate, setListenDate] = useState(fechaHoraActual.toISOString().slice(0, 16));
    
    // Modal de nuevo artista
    const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
    const [artistError, setArtistError] = useState("");
    
    // Modal de nueva canción
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [songError, setSongError] = useState("");
    
    // Autocompletado artista
    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState([]);
    const [formattedName, setFormattedName] = useState("");
    
    const [registerNewArtistForm, setRegisterNewArtistForm] = useState({
        name: "",
        genero: "",
        genero_musical: "",
        bio: "",
        image: "",
        pais: "",
        fecha_de_nacimiento: "",
        discográfica: "",
        youtube: "",
        spotify: "",
        instagram: "",
        other_links: ""
    });

    const [registerNewSongForm, setRegisterNewSongForm] = useState({
        title: "",
        duration: "",
        album: ""
    });

    // Cargar artistas al montar
    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            const response = await api.get("/artists", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setArtists(response.data);
        } catch (err) {
            console.error("Error fetching artists", err);
        }
    };

    const fetchSongsByArtist = async (artistId) => {
        try {
            const response = await api.get("/songs", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const filteredSongs = response.data.filter(song => song.artist_id === artistId);
            setSongs(filteredSongs);
        } catch (err) {
            console.error("Error fetching songs", err);
        }
    };

    // Autocompletado
    const handleArtistChange = (e) => {
        const valor = e.target.value;
        setQuery(valor);
        setSelectedArtist(null);

        if (valor.trim() === "") {
            setResultados([]);
            return;
        }

        const coincidencias = artists.filter(artist =>
            artist.name.toLowerCase().includes(valor.toLowerCase())
        );
        setResultados(coincidencias);
    };

    const seleccionarArtista = (artist) => {
        setQuery(artist.name);
        setSelectedArtist(artist);
        setResultados([]);
        fetchSongsByArtist(artist.id);
    };

    const formatValue = () => {
        setFormattedName(query.trim().replace(/\w\S*/g, text => 
            text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        ));
    };

    useEffect(() => {
        if (isArtistModalOpen) {
            setRegisterNewArtistForm(prev => ({ ...prev, name: formattedName }));
        }
    }, [isArtistModalOpen, formattedName]);

    const handleRegisterArtist = async () => {
        try {
            const response = await api.post("/artists/create", registerNewArtistForm, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setIsArtistModalOpen(false);
            await fetchArtists();
            seleccionarArtista(response.data);
            setQuery(response.data.name);
            setArtistError("");
        } catch (error) {
            setArtistError(error.response?.data?.message || "Error al registrar artista");
        }
    };

    const handleRegisterSong = async () => {
        if (!registerNewSongForm.title || !registerNewSongForm.duration) {
            setSongError("Título y duración son obligatorios");
            return;
        }

        try {
            const response = await api.post("/songs/create", {
                ...registerNewSongForm,
                artist_id: selectedArtist.id,
                duration: parseInt(registerNewSongForm.duration)
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            
            setIsSongModalOpen(false);
            await fetchSongsByArtist(selectedArtist.id);
            setSelectedSong(response.data);
            setSongError("");
            
            // Reset form
            setRegisterNewSongForm({
                title: "",
                duration: "",
                album: ""
            });
        } catch (error) {
            setSongError(error.response?.data?.message || "Error al registrar canción");
        }
    };

    // Navegación entre pasos
    const nextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const validateStep = () => {
        if (step === 1 && !selectedArtist) {
            alert("Por favor, selecciona un artista");
            return false;
        }
        if (step === 2 && !selectedSong) {
            alert("Por favor, selecciona una canción");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!selectedSong) {
            alert("Por favor, completa todos los pasos");
            return;
        }

        try {
            const response = await api.post("/listens/create", {
                song_id: selectedSong.id,
                listened_at: listenDate
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            alert("✅ ¡Escucha registrada con éxito!");
            
            // Reset form
            setStep(1);
            setQuery("");
            setSelectedArtist(null);
            setSelectedSong(null);
            setSongs([]);
            setListenDate(new Date().toISOString().slice(0, 16));
        } catch (error) {
            console.error("Error registering listen:", error);
            alert("❌ Error al registrar la escucha");
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "80px auto", padding: "0 20px" }}>
            <h1 style={{ marginBottom: "30px", color: "#2d5016" }}>🎵 Registrar Escucha</h1>

            {/* Indicador de progreso */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: "40px",
                position: "relative"
            }}>
                {[1, 2, 3, 4].map((num) => (
                    <div key={num} style={{ textAlign: "center", flex: 1 }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: step >= num ? "#2d5016" : "#e0e0e0",
                            color: step >= num ? "white" : "#999",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                            fontWeight: "bold",
                            fontSize: "18px"
                        }}>
                            {num}
                        </div>
                        <div style={{ 
                            marginTop: "8px", 
                            fontSize: "12px",
                            color: step >= num ? "#2d5016" : "#999"
                        }}>
                            {num === 1 && "Artista"}
                            {num === 2 && "Canción"}
                            {num === 3 && "Fecha/Hora"}
                            {num === 4 && "Confirmar"}
                        </div>
                    </div>
                ))}
                <div style={{
                    position: "absolute",
                    top: "20px",
                    left: "10%",
                    right: "10%",
                    height: "2px",
                    backgroundColor: "#e0e0e0",
                    zIndex: -1
                }}>
                    <div style={{
                        height: "100%",
                        backgroundColor: "#2d5016",
                        width: `${((step - 1) / 3) * 100}%`,
                        transition: "width 0.3s"
                    }}></div>
                </div>
            </div>

            {/* STEP 1: Seleccionar Artista */}
            {step === 1 && (
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "40px", 
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ marginBottom: "20px" }}>¿Qué artista estás escuchando?</h2>
                    <input 
                        type="text" 
                        value={query} 
                        onChange={handleArtistChange}
                        placeholder="Escribe el nombre del artista..."
                        style={{
                            width: "100%", 
                            padding: "15px",
                            fontSize: "16px",
                            border: "2px solid #e0e0e0",
                            borderRadius: "8px",
                            marginBottom: "10px"
                        }}
                    />
                    
                    <div style={{ 
                        maxHeight: "300px", 
                        overflowY: "auto",
                        border: resultados.length > 0 ? "1px solid #e0e0e0" : "none",
                        borderRadius: "8px"
                    }}>
                        {resultados.map(artist => (
                            <div 
                                key={artist.id} 
                                onClick={() => seleccionarArtista(artist)}
                                style={{
                                    padding: "15px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f0f0f0",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#f5e6d3"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                            >
                                <strong>{artist.name}</strong>
                                {artist.genero_musical && (
                                    <span style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}>
                                        ({artist.genero_musical})
                                    </span>
                                )}
                            </div>
                        ))}
                        
                        {resultados.length === 0 && query.trim() !== "" && (
                            <div 
                                onClick={() => { setIsArtistModalOpen(true); formatValue(); }}
                                style={{
                                    padding: "15px",
                                    cursor: "pointer",
                                    backgroundColor: "#f5e6d3",
                                    borderRadius: "8px",
                                    color: "#2d5016",
                                    fontWeight: "bold"
                                }}
                            >
                                ➕ Registrar nuevo artista: {query}
                            </div>
                        )}
                    </div>

                    {selectedArtist && (
                        <div style={{
                            marginTop: "20px",
                            padding: "15px",
                            backgroundColor: "#d4edda",
                            borderRadius: "8px",
                            color: "#155724"
                        }}>
                            ✅ Artista seleccionado: <strong>{selectedArtist.name}</strong>
                        </div>
                    )}

                    <div style={{ marginTop: "30px", textAlign: "right" }}>
                        <button 
                            onClick={nextStep}
                            disabled={!selectedArtist}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: selectedArtist ? "#2d5016" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: selectedArtist ? "pointer" : "not-allowed"
                            }}
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: Seleccionar Canción */}
            {step === 2 && (
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "40px", 
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ marginBottom: "20px" }}>
                        ¿Qué canción de {selectedArtist?.name} estás escuchando?
                    </h2>
                    
                    {songs.length === 0 ? (
                        <div style={{ 
                            padding: "40px", 
                            textAlign: "center",
                            backgroundColor: "#fff3cd",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}>
                            <p style={{ marginBottom: "20px", fontSize: "16px" }}>
                                😕 No hay canciones registradas para <strong>{selectedArtist?.name}</strong> aún.
                            </p>
                            <button
                                onClick={() => setIsSongModalOpen(true)}
                                style={{
                                    padding: "12px 30px",
                                    backgroundColor: "#2d5016",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "bold"
                                }}
                            >
                                ➕ Añadir primera canción
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ 
                                display: "grid",
                                gap: "10px",
                                maxHeight: "350px",
                                overflowY: "auto",
                                marginBottom: "20px"
                            }}>
                                {songs.map(song => (
                                    <div
                                        key={song.id}
                                        onClick={() => setSelectedSong(song)}
                                        style={{
                                            padding: "20px",
                                            border: selectedSong?.id === song.id 
                                                ? "3px solid #2d5016" 
                                                : "2px solid #e0e0e0",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            backgroundColor: selectedSong?.id === song.id 
                                                ? "#f5e6d3" 
                                                : "white",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                                            {selectedSong?.id === song.id && "✅ "}
                                            {song.title}
                                        </div>
                                        {song.album && (
                                            <div style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
                                                Álbum: {song.album}
                                            </div>
                                        )}
                                        {song.duration && (
                                            <div style={{ color: "#999", fontSize: "12px", marginTop: "3px" }}>
                                                Duración: {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ 
                                padding: "15px", 
                                backgroundColor: "#f5e6d3",
                                borderRadius: "8px",
                                textAlign: "center"
                            }}>
                                <button
                                    onClick={() => setIsSongModalOpen(true)}
                                    style={{
                                        padding: "10px 25px",
                                        backgroundColor: "#7d9d6f",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    ➕ No encuentro mi canción, añadir nueva
                                </button>
                            </div>
                        </>
                    )}

                    <div style={{ 
                        marginTop: "30px", 
                        display: "flex", 
                        justifyContent: "space-between" 
                    }}>
                        <button 
                            onClick={prevStep}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "#7d9d6f",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >
                            ← Anterior
                        </button>
                        <button 
                            onClick={nextStep}
                            disabled={!selectedSong}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: selectedSong ? "#2d5016" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: selectedSong ? "pointer" : "not-allowed"
                            }}
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: Fecha y Hora */}
            {step === 3 && (
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "40px", 
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ marginBottom: "20px" }}>¿Cuándo escuchaste esta canción?</h2>
                    
                    <div style={{ marginBottom: "30px" }}>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "10px",
                            fontWeight: "bold",
                            color: "#2d5016"
                        }}>
                            Fecha y Hora:
                        </label>
                        <input
                            type="datetime-local"
                            value={listenDate}
                            onChange={(e) => setListenDate(e.target.value)}
                            max={new Date().toISOString().slice(0, 16)}
                            style={{
                                width: "100%",
                                padding: "15px",
                                fontSize: "16px",
                                border: "2px solid #e0e0e0",
                                borderRadius: "8px"
                            }}
                        />
                        <p style={{ 
                            marginTop: "10px", 
                            color: "#666",
                            fontSize: "14px"
                        }}>
                            Por defecto se registra la fecha y hora actual
                        </p>
                    </div>

                    <div style={{ 
                        marginTop: "30px", 
                        display: "flex", 
                        justifyContent: "space-between" 
                    }}>
                        <button 
                            onClick={prevStep}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "#7d9d6f",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >
                            ← Anterior
                        </button>
                        <button 
                            onClick={nextStep}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "#2d5016",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: Confirmación */}
            {step === 4 && (
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "40px", 
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ marginBottom: "30px", color: "#2d5016" }}>
                        Confirma los datos de tu escucha
                    </h2>
                    
                    <div style={{ 
                        backgroundColor: "#f5e6d3",
                        padding: "30px",
                        borderRadius: "10px",
                        marginBottom: "30px"
                    }}>
                        <div style={{ marginBottom: "20px" }}>
                            <strong style={{ color: "#2d5016" }}>Artista:</strong>
                            <div style={{ fontSize: "20px", marginTop: "5px" }}>
                                {selectedArtist?.name}
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: "20px" }}>
                            <strong style={{ color: "#2d5016" }}>Canción:</strong>
                            <div style={{ fontSize: "20px", marginTop: "5px" }}>
                                {selectedSong?.title}
                            </div>
                            {selectedSong?.album && (
                                <div style={{ color: "#666", fontSize: "14px", marginTop: "3px" }}>
                                    Álbum: {selectedSong.album}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <strong style={{ color: "#2d5016" }}>Fecha y Hora:</strong>
                            <div style={{ fontSize: "18px", marginTop: "5px" }}>
                                {new Date(listenDate).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        marginTop: "30px", 
                        display: "flex", 
                        justifyContent: "space-between" 
                    }}>
                        <button 
                            onClick={prevStep}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "#7d9d6f",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >
                            ← Anterior
                        </button>
                        <button 
                            onClick={handleSubmit}
                            style={{
                                padding: "15px 40px",
                                backgroundColor: "#2d5016",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                            }}
                        >
                            ✅ Registrar Escucha
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de nuevo artista */}
            {isArtistModalOpen && (
                <Modal onClose={() => setIsArtistModalOpen(false)}>
                    <h2 style={{ fontSize: "1.6em", marginBottom: "30px" }}>
                        <u>Registrar nuevo artista</u>
                    </h2>
                    <div style={{ 
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: "30px",
                        rowGap: "20px",
                        maxHeight: "60vh",
                        overflowY: "auto",
                        paddingRight: "10px"
                    }}>
                        <div>
                            <label>Nombre del artista:</label>
                            <input
                                value={formattedName}
                                onChange={(e) => {
                                    setFormattedName(e.target.value);
                                    setRegisterNewArtistForm(prev => ({ ...prev, name: e.target.value }));
                                }}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div>
                            <label>Género del artista:</label>
                            <select
                                value={registerNewArtistForm.genero || ""}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, genero: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                            </select>
                        </div>

                        <div>
                            <label>Género musical:</label>
                            <input
                                value={registerNewArtistForm.genero_musical}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, genero_musical: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div>
                            <label>País:</label>
                            <input
                                value={registerNewArtistForm.pais}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, pais: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                            <label>Biografía:</label>
                            <textarea
                                value={registerNewArtistForm.bio}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, bio: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px", minHeight: "80px" }}
                            />
                        </div>

                        <div>
                            <label>Fecha nacimiento:</label>
                            <input
                                type="date"
                                value={registerNewArtistForm.fecha_de_nacimiento}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, fecha_de_nacimiento: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div>
                            <label>Discográfica:</label>
                            <input
                                value={registerNewArtistForm.discográfica}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, discográfica: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div>
                            <label>YouTube:</label>
                            <input
                                value={registerNewArtistForm.youtube}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, youtube: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div>
                            <label>Spotify:</label>
                            <input
                                value={registerNewArtistForm.spotify}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, spotify: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div>
                            <label>Instagram:</label>
                            <input
                                value={registerNewArtistForm.instagram}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, instagram: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>

                        <div>
                            <label>Imagen (URL):</label>
                            <input
                                value={registerNewArtistForm.image}
                                onChange={(e) => setRegisterNewArtistForm(prev => ({ ...prev, image: e.target.value }))}
                                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginTop: "30px" }}>
                        <button 
                            onClick={handleRegisterArtist}
                            style={{
                                padding: "10px 30px",
                                backgroundColor: "#2d5016",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Registrar Artista
                        </button>
                        {artistError && (
                            <span style={{ color: "red", marginLeft: "20px" }}>
                                {artistError}
                            </span>
                        )}
                    </div>
                </Modal>
            )}

            {/* Modal de nueva canción */}
            {isSongModalOpen && (
                <Modal onClose={() => {
                    setIsSongModalOpen(false);
                    setSongError("");
                    setRegisterNewSongForm({ title: "", duration: "", album: "" });
                }}>
                    <h2 style={{ fontSize: "1.6em", marginBottom: "30px", color: "#2d5016" }}>
                        ➕ Añadir canción de <u>{selectedArtist?.name}</u>
                    </h2>
                    
                    <div style={{ display: "grid", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                                Título de la canción: <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={registerNewSongForm.title}
                                onChange={(e) => setRegisterNewSongForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ej: Bohemian Rhapsody"
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    fontSize: "16px",
                                    border: "2px solid #e0e0e0",
                                    borderRadius: "8px"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                                Duración (en segundos): <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                                type="number"
                                value={registerNewSongForm.duration}
                                onChange={(e) => setRegisterNewSongForm(prev => ({ ...prev, duration: e.target.value }))}
                                placeholder="Ej: 354 (5 minutos 54 segundos)"
                                min="1"
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    fontSize: "16px",
                                    border: "2px solid #e0e0e0",
                                    borderRadius: "8px"
                                }}
                            />
                            {registerNewSongForm.duration && (
                                <p style={{ marginTop: "5px", color: "#666", fontSize: "14px" }}>
                                    = {Math.floor(registerNewSongForm.duration / 60)}:{String(registerNewSongForm.duration % 60).padStart(2, '0')} minutos
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                                Álbum (opcional):
                            </label>
                            <input
                                type="text"
                                value={registerNewSongForm.album}
                                onChange={(e) => setRegisterNewSongForm(prev => ({ ...prev, album: e.target.value }))}
                                placeholder="Ej: A Night at the Opera"
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    fontSize: "16px",
                                    border: "2px solid #e0e0e0",
                                    borderRadius: "8px"
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: "30px", display: "flex", gap: "15px", alignItems: "center" }}>
                        <button 
                            onClick={handleRegisterSong}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "#2d5016",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: "bold"
                            }}
                        >
                            ✅ Guardar Canción
                        </button>
                        <button 
                            onClick={() => {
                                setIsSongModalOpen(false);
                                setSongError("");
                                setRegisterNewSongForm({ title: "", duration: "", album: "" });
                            }}
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "#999",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            Cancelar
                        </button>
                    </div>

                    {songError && (
                        <div style={{ 
                            marginTop: "15px", 
                            padding: "12px",
                            backgroundColor: "#f8d7da",
                            color: "#721c24",
                            borderRadius: "8px",
                            fontSize: "14px"
                        }}>
                            ⚠️ {songError}
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}