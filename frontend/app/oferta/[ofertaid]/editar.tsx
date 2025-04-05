import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";




const EditarOfertaScreen = () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      
    const [offerData, setOfferData] = useState<any>(null);
    const [offerTrabajoData, setOfferTrabajoData] = useState<any>(null);
    const [offerCargaData, setOfferCargaData] = useState<any>(null);
    const { user, userToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const { ofertaid } = useLocalSearchParams();

    const [formData, setFormData] = useState({
        titulo: "",
        experiencia: null,
        licencia: "",
        notas: "",
        estado: "BORRADOR",
        sueldo: null,
        localizacion: "",
        fechaPublicacion: new Date().toISOString(), // Fecha actual del sistema
        empresa: { id: user?.id ?? null },
        // Trabajo
        fechaIncorporacion: "",
        jornada: "",
        // Carga
        mercancia: "",
        peso: null,
        origen: "",
        destino: "",
        distancia: null,
        inicio: "",
        finMinimo: "",
        finMaximo: "",
    });

    useEffect(() => {
        if (!user || !userToken) {
            router.push("/login");
        }
    }, [user, userToken]);

    
    if(!user || !user.rol) {
       return null;
    }

    useEffect(() => {
        if (user?.id) {
          setFormData((prevState) => ({
            ...prevState,
            empresa: { id: user.id },
          }));
        }
    }, [user]);

    useEffect(() => {
        if (ofertaid) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}`);
                    const data = await response.json();
                    setFormData(data);
                    
                    if(data.tipoOferta === "TRABAJO"){
                        const trabajoResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`);
                        const trabajoData = await trabajoResponse.json();
                        setOfferTrabajoData(trabajoData);
                    } else if (data.tipoOferta === "CARGA") {
                        const cargaResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/carga`);
                        const cargaText = await cargaResponse.text();
                        const cargaData = cargaText ? JSON.parse(cargaText) : null;
                        setOfferCargaData(cargaData);
                    }

                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [ofertaid]);

    useEffect(() => {
        if (ofertaid) {
          setFormData({
            titulo: "",
            experiencia: null,
            licencia: "",
            notas: "",
            estado: "BORRADOR",
            sueldo: null,
            localizacion: "",
            fechaPublicacion: new Date().toISOString(), // Fecha actual del sistema
            empresa: { id: user?.id ?? null },
            // Trabajo
            fechaIncorporacion: "",
            jornada: "",
            // Carga
            mercancia: "",
            peso: null,
            origen: "",
            destino: "",
            distancia: null,
            inicio: "",
            finMinimo: "",
            finMaximo: "",
          });
        }
      }, [user]); 
    
    const handleInputChange = (field, value) => {
        let formattedValue = value;
    
        // Si el campo es "licencia", reemplazamos "+" por "_"
        if (field === "licencia") {
          formattedValue = value.replace(/\+/g, "_");
        }
    
        setFormData((prevState) => ({ ...prevState, [field]: formattedValue }));
    };


    
    return (
        <div>
        <h1>Editar Oferta</h1>
        {/* Aquí puedes agregar el formulario para editar la oferta */}
        </div>
    );
}   