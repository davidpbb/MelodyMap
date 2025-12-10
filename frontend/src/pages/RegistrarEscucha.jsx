import { useState } from "react";
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

    // autofill formulario
    // query = texto del input
    // resultados = sugerencias
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
                                <div key={"asd"} onClick={()=>setIsOpen(true)} style={{padding:"8px", cursor:"pointer"}}>
                                    {"Registrar nuevo artista: " + query}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </form>
            {isOpen && (<Modal onClose={() => setIsOpen(false)}>
                    <h2>Registrar nuevo artista</h2>
                </Modal>
            )}
        </div>
    );
}