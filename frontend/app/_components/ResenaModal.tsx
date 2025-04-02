// components/AddResenaModal.tsx
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import colors from "../../assets/styles/colors";
import { FontAwesome } from "@expo/vector-icons";

interface ResenaModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        valoracion: number;
        comentarios: string;
        comentador: { id: string };
        comentado: { id: string };
    }) => void;
    comentadorId: string;
    comentadoId: string;
}

const ResenaModal: React.FC<ResenaModalProps> = ({
    visible,
    onClose,
    onSubmit,
    comentadorId,
    comentadoId
}) => {
    const [valoracion, setValoracion] = useState(0);
    const [comentario, setComentario] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (valoracion === 0) {
            setError("Por favor selecciona una valoración");
            return;
        }
        if (!comentario.trim()) {
            setError("Por favor escribe un comentario");
            return;
        }
        if (comentario.length < 10) {
            setError("El comentario debe tener al menos 10 caracteres");
            return;
        }

        onSubmit({
            valoracion,
            comentarios: comentario,
            comentador: { id: comentadorId },
            comentado: { id: comentadoId }
        });
        // Reset form
        setValoracion(0);
        setComentario("");
        setError("");
        onClose();
    };

    return (
        <Modal visible={visible} transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Añadir Reseña</Text>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setValoracion(star)}>
                                <FontAwesome
                                    name={star <= valoracion ? "star" : "star-o"}
                                    size={30}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Comentario:</Text>
                    <TextInput
                        style={styles.comentarioInput}
                        multiline
                        numberOfLines={4}
                        placeholder="Escribe tu experiencia..."
                        value={comentario}
                        onChangeText={setComentario}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Enviar Reseña</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 10,
        width: "30%",
        justifyContent: "center"
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.secondary,
        marginBottom: 15,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: colors.secondary,
        fontWeight: 700,
    },
    starsContainer: {
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-between",
        marginBottom: 15,
        width: "70%"
    },
    comentarioInput: {
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 5,
        outlineColor: colors.mediumGray,
        padding: 10,
        marginBottom: 15,
        minHeight: 100,
        textAlignVertical: "top",
    },
    errorText: {
        color: colors.red,
        marginBottom: 10,
        textAlign: "center",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelButton: {
        backgroundColor: colors.secondary,
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 5,
        flex: 1,
    },
    buttonText: {
        color: colors.white,
        textAlign: "center",
        fontWeight: "bold",
    },
});

export default ResenaModal;