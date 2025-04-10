import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../../assets/styles/colors";

const DraftModal = ({ isVisible, onClose, onViewDrafts, onCreateNew }) => {
    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Tienes ofertas en borrador</Text>
                    <Text style={styles.modalText}>¿Qué deseas hacer?</Text>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.red }]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor:colors.green}]}
                            onPress={onViewDrafts}
                        >
                            <Text style={styles.buttonText}>Ver borradores</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.createNewButton]}
                            onPress={onCreateNew}
                        >
                            <Text style={styles.buttonText}>Crear nueva oferta</Text>
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '30%',
        backgroundColor: colors.white,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        color: colors.darkGray,
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    viewDraftsButton: {
        backgroundColor: colors.primaryLight,
    },
    createNewButton: {
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 10,
    },
    cancelButtonText: {
        color: colors.mediumGray,
        textDecorationLine: 'underline',
    },
});

export default DraftModal;