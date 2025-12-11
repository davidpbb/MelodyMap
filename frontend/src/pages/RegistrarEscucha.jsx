import { useState, useEffect } from "react";
import api from "../api/axios";
import Modal from "../components/Modal.jsx";

export default function RegistrarEscucha() {

    const [step, setStep] = useState(1)

    const [faltaCampo, setFaltaCampo] = useState(false)
    const [campoFaltante, setCampoFaltante] = useState("")
    const [isOpen, setIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        artista: ""
        // todo form inputs
    })

    const [formattedName, setFormattedName] = useState("")
    const [registerNewArtistForm, setRegisterNewArtistForm] = useState({
        nombre: "",
        genero: "",
        genero_musical: ""
    })

    const [query, setQuery] = useState("")
    const [resultados, setResultados] = useState([])

    const getDatos = async () => {
        try {
            const response = await api.get("/artists", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const artists = response.data.map(artist => artist.name);
            return artists;
        } catch (err) {
            console.error("Error fetching artists", err);
        }
    }

    const datos = []
    getDatos().then(artists => {datos.push(...artists)})

    const seleccionar = item => {
        setQuery(item)
        setResultados([])
    }

    const handleArtistChange = e => {
        const valor = e.target.value
        setQuery(valor)

        if(valor.trim() === ""){
            setResultados([])
            return
        }

        const coincidencias = datos.filter(item =>
            item.toLowerCase().includes(valor.toLowerCase())
        )

        setResultados(coincidencias)
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
            setRegisterNewArtistForm(prev => ({ ...prev, nombre: formattedName }));
        }
    }, [isOpen]);




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
                        {}
                        <div style={{ height: "30vh" }}>
                            {resultados.length > 0 && resultados.map(item => (
                                    <div key={item} onClick={()=>seleccionar(item)} style={{padding:"8px", cursor:"pointer"}}>
                                        {item}
                                    </div>
                                ))
                            }
                            {resultados.length === 0 && query !== "" && (
                                <div key={"newArtist"} onClick={()=>{setIsOpen(true); formatValue()}} style={{padding:"8px", cursor:"pointer"}}>
                                    {"Registrar nuevo artista: " + query}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </form>
            {isOpen && (<Modal onClose={() => setIsOpen(false)}>
                    <h2 style={{ fontSize: "1.6em" }}>Registrar nuevo artista</h2>
                    <div style={{ marginTop: "30px" }} name="artista">
                        <div>
                            <label htmlFor="input_nombre_artista">Nombre del artista: </label>
                            <input style={{ marginLeft: "10px" }} id="input_nombre_artista" value={formattedName} onChange={(e)=>{setFormattedName(e.target.value);  setRegisterNewArtistForm(prev => ({ ...prev, nombre: e.target.value })) }} />
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <label htmlFor="input_genero_artista">Género del artista: </label>
                            <select style={{ marginLeft: "15px" }} id="input_genero_artista" value={registerNewArtistForm.genero || "vacio"} onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, genero: e.target.value })) }>
                                <option value="vacio" disabled></option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                            </select>
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <label htmlFor="input_genero_musical_artista">Género musical: </label>
                            <input style={{ marginLeft: "32px" }} id="input_genero_musical_artista" value={registerNewArtistForm.genero_musical} onChange={(e)=>setRegisterNewArtistForm(prev => ({ ...prev, genero_musical: e.target.value })) } />
                        </div>
                    </div>
                    <button onClick={()=>{console.log(registerNewArtistForm)}} />
                </Modal>
            )}
        </div>
    );
}