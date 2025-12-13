import { useState, useEffect } from "react";
import api from "../api/axios";
import Modal from "../components/Modal.jsx";

export default function RegistrarEscucha() {

    const [step, setStep] = useState(1)

    const [faltaCampo, setFaltaCampo] = useState(false)
    const [campoFaltante, setCampoFaltante] = useState("")
    const [isOpen, setIsOpen] = useState(false);
    const [postApiError, setPostApiError] = useState("");
    const [artistExists, setArtistExists] = useState(false);
    const [datos, setDatos] = useState([]);

    const [formData, setFormData] = useState({
        artista: ""
        // todo form inputs
    })

    const [formattedName, setFormattedName] = useState("")
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
    })

    const [query, setQuery] = useState("")
    const [resultados, setResultados] = useState([])

    const getDatos = async () => {
        try {
            const response = await api.get("/artists", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const artists = response.data.map(artist => artist.name);
            setDatos(artists);
        } catch (err) {
            console.error("Error fetching artists", err);
        }
    }

    useEffect(() => {
        getDatos();
    }, []);


    const seleccionar = item => {
        setQuery(item)
        setResultados([])
        setArtistExists(true);
    }

    const handleArtistChange = e => {
        const valor = e.target.value
        setQuery(valor)
        setArtistExists(false);

        if(valor.trim() === ""){
            setResultados([])
            return
        }

        const coincidencias = datos.filter(item =>
            item.toLowerCase().includes(valor.toLowerCase())
        )

        setResultados(coincidencias);

        const exactMatch = datos.some(item => 
            item.toLowerCase() === valor.toLowerCase().trim()
        );
        if (exactMatch) {setArtistExists(true);}
    }

    const nextStep = ()=>{
        if(validateStep()) setStep(step + 1)
    }
    const prevStep = ()=>{
        if(step > 1) setStep(step - 1)
    }

    const formatValue = (e) => setFormattedName(query.trim().replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()));

    useEffect(() => {
        if (isOpen) {
            setRegisterNewArtistForm(prev => ({ ...prev, name: formattedName }));
        }
    }, [isOpen]);

    const handleRegisterArtist = async () => {
        try {
            const response = await api.post("/artists/create", registerNewArtistForm, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
        }
        catch (error) {
            setPostApiError(error.response?.data?.message);
            return;
        }
        setIsOpen(false);
        setQuery(registerNewArtistForm.name);
        datos.length = 0;
    }



    // todo añadir mas logica de verificacion que el artista exista
    const validateStep = () => {
        if(step === 1){
            if(!formData.artista){
                setFaltaCampo(true);
                setCampoFaltante("Artista")
                return false
            }
        }

        return true
    }

    
    
    // Manejar cambios de inputs todo
    const handleFormChange = e=>{
        setFormData({...formData, [e.target.name]: e.target.value})
    }

    // Enviar a la API en el último paso
    const handleSubmit = async ()=>{
        if(!validateStep()) return

        const res = await fetch("http://localhost:8000/api/formulario",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData)
        })

        if(res.ok){
        alert("Formulario enviado con éxito!")
        }else{
        alert("Error al enviar")
        }
    }




    return (
        <div style={{ maxWidth: "900px", margin: "80px" }}>
            
            <h1 style={{ marginBottom: "20px" }}>Registrar Escucha</h1>

            {step === 1 && (<><h2 style={{ marginBottom: "20px" }}>¿Qué artista estás escuchando?</h2></>)}

            <form>
                {step === 1 && (
                    <>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input 
                                type="text" 
                                value={query} 
                                onChange={handleArtistChange}
                                placeholder="Escribe el nombre del artista"
                                style={{width:"100%", padding:"6px"}}
                            /> {step == 1 && <button onClick={nextStep}>Siguiente</button>}
                        </div>
                        <div style={{ height: "30vh" }}>
                            {resultados.length > 0 && resultados.map(item => (
                                    <div key={item} onClick={()=>seleccionar(item)} style={{padding:"8px", cursor:"pointer"}}>
                                        {item}
                                    </div>
                                ))
                            }
                            {resultados.length === 0 && query.trim() !== "" && !artistExists && (
                                <div key={"newArtist"} onClick={()=>{setIsOpen(true); formatValue(); }} style={{padding:"8px", cursor:"pointer"}}>
                                    {"Registrar nuevo artista: " + query}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </form>
            {isOpen && (<Modal onClose={() => setIsOpen(false)}>
                    <h2 style={{ fontSize: "1.6em" }}><u>Registrar nuevo artista</u></h2>
                    <div name="artista" style={{ 
                            marginTop: "30px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            columnGap: "30px",
                            rowGap: "35px",
                            paddingLeft: "5px",
                            paddingRight: "30px"
                        }} >

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_nombre_artista">Nombre del artista:</label>
                            <input
                                id="input_nombre_artista"
                                value={formattedName}
                                onChange={(e)=>{
                                    setFormattedName(e.target.value);
                                    setRegisterNewArtistForm(prev => ({ ...prev, name: e.target.value }))
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_genero_artista">Género del artista:</label>
                            <select
                                id="input_genero_artista"
                                value={registerNewArtistForm.genero || "vacio"}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, genero: e.target.value }))}
                            >
                                <option value="vacio" disabled></option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_genero_musical_artista">Género musical:</label>
                            <input
                                id="input_genero_musical_artista"
                                value={registerNewArtistForm.genero_musical}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, genero_musical: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_bio_artista">Biografía:</label>
                            <textarea
                                id="input_bio_artista"
                                value={registerNewArtistForm.bio}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, bio: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_image_artista">Imagen (URL):</label>
                            <input
                                id="input_image_artista"
                                value={registerNewArtistForm.image}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, image: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_pais_artista">País:</label>
                            <input
                                id="input_pais_artista"
                                value={registerNewArtistForm.pais}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, pais: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_fecha_artista">Fecha nacimiento:</label>
                            <input
                                type="date"
                                id="input_fecha_artista"
                                style={{ paddingLeft: "55px", paddingRight: "20px" }}
                                value={registerNewArtistForm.fecha_de_nacimiento}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, fecha_de_nacimiento: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_discografica_artista">Discográfica:</label>
                            <input
                                id="input_discografica_artista"
                                value={registerNewArtistForm.discográfica}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, discográfica: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_youtube_artista">YouTube:</label>
                            <input
                                id="input_youtube_artista"
                                value={registerNewArtistForm.youtube}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, youtube: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_spotify_artista">Spotify:</label>
                            <input
                                id="input_spotify_artista"
                                value={registerNewArtistForm.spotify}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, spotify: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_instagram_artista">Instagram:</label>
                            <input
                                id="input_instagram_artista"
                                value={registerNewArtistForm.instagram}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, instagram: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="input_other_links_artista">Otros enlaces:</label>
                            <input
                                id="input_other_links_artista"
                                value={registerNewArtistForm.other_links}
                                onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, other_links: e.target.value }))}
                            />
                        </div>

                    </div>
                    
                    <div>
                        <button style={{ padding: "5px", marginTop: "17px" }} onClick={()=>{handleRegisterArtist()}}>Registrar</button>
                        {postApiError != "" && <span style={{ color: "red", marginLeft: "120px" }}>{postApiError}</span>}
                    </div>
                    
                </Modal>
            )}
        </div>
    );
}