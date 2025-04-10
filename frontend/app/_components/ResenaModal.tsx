import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
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
    initialRating?: number;
    initialComment?: string;
}

const ResenaModal: React.FC<ResenaModalProps> = ({
    visible,
    onClose,
    onSubmit,
    comentadorId,
    comentadoId,
    initialRating = 0,
    initialComment = ""
}) => {
    const [valoracion, setValoracion] = useState(initialRating);
    const [comentario, setComentario] = useState(initialComment);
    const [error, setError] = useState("");

    useEffect(() => {
        if (visible) {
            setValoracion(initialRating);
            setComentario(initialComment);
            setError("");
        }
    }, [visible, initialRating, initialComment]);

    const handleSubmit = () => {
        if (valoracion === 0) {
            setError("Por favor selecciona una valoración");
            return;
        }
        if (comentario.length > 502) {
            setError("El comentario no puede tener más de 500 caracteres");
            return;
        }

        onSubmit({
            valoracion,
            comentarios: comentario,
            comentador: { id: comentadorId },
            comentado: { id: comentadoId }
        });
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {initialRating ? "Editar Reseña" : "Añadir Reseña"}
                    </Text>

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

                    <Text style={{ textAlign: "right", marginBottom: 10 }}>
                        {comentario.length}/500
                    </Text>


                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>{initialRating ? "Actualizar" : "Enviar"}</Text>
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
        width: "85%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.secondary,
        marginBottom: 15,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: colors.secondary,
        fontWeight: "bold",
    },
    starsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
        gap: 10,
    },
    comentarioInput: {
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        minHeight: 120,
        textAlignVertical: "top",
        fontSize: 16,
    },
    errorText: {
        color: colors.red,
        marginBottom: 15,
        textAlign: "center",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    cancelButton: {
        backgroundColor: colors.mediumGray,
        padding: 15,
        borderRadius: 10,
        flex: 1,
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        flex: 1,
    },
    buttonText: {
        color: colors.white,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default ResenaModal;