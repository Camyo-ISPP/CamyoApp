import { router } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, Image, Animated, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from '@react-native-picker/picker';
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from "@expo/vector-icons";
const DefaultLogo = require('../../assets/images/defaultCompImg.png');

export default function BuscarOfertas({ searchQuery: externalSearchQuery = '' }: { searchQuery?: string }) {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
    const [selectedOfertaType, setSelectedOfertaType] = useState<'cargas' | 'trabajos' | null>(null);
    const [origenFilter, setOrigenFilter] = useState('');
    const [destinoFilter, setDestinoFilter] = useState('');
    const [minPesoFilter, setMinPesoFilter] = useState('');
    const [maxPesoFilter, setMaxPesoFilter] = useState('');
    const [minExperienceFilter, setMinExperienceFilter] = useState(''); // [min, max]
    const [minSalaryFilter, setMinSalaryFilter] = useState('');

    useEffect(() => {
        const handleUrlChange = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const queryFromUrl = urlParams.get('query') || '';
            if (queryFromUrl) {
                setSearchQuery(queryFromUrl);
                handleSearch(queryFromUrl);
            } else {
                setFilteredData(data);
            }
        };
        handleUrlChange();

        const onPopState = () => handleUrlChange();
        window.addEventListener('popstate', onPopState);

        return () => {
            window.removeEventListener('popstate', onPopState);
        };
    }, [data]);

    useEffect(() => {
        fetchData();
    }, [selectedOfertaType]);

    useEffect(() => {
        console.log("selectedOfertaType cambió a:", selectedOfertaType);
    }, [selectedOfertaType]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/ofertas/info`);
            setData(response.data);
            setFilteredData(response.data);
            console.log('Datos cargados:', response.data);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query = searchQuery) => {
        console.log("Ejecutando handleSearch")
        const normalizedQuery = query.toLowerCase();
        let filteredResults = data.filter((item) => {
            return (
                item.titulo?.toLowerCase().includes(normalizedQuery) ||
                item.nombreEmpresa?.toLowerCase().includes(normalizedQuery) ||
                item.notas?.toLowerCase().includes(normalizedQuery) ||
                item.tipoOferta?.toLowerCase().includes(normalizedQuery)
            );
        });

        if (selectedOfertaType === 'cargas') {
            filteredResults = filteredResults.filter((item) => item.tipoOferta === 'CARGA');

            // Origen Filter
            if (origenFilter) {
                filteredResults = filteredResults.filter((item) =>
                    item.origen?.toLowerCase().includes(origenFilter.toLowerCase())
                );
            }

            // Destino Filter
            if (destinoFilter) {
                filteredResults = filteredResults.filter((item) =>
                    item.destino?.toLowerCase().includes(destinoFilter.toLowerCase())
                );
            }

            // Peso Mínimo Filter
            if (minPesoFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.peso >= parseFloat(minPesoFilter)
                );
            }

            // Peso Máximo Filter
            if (maxPesoFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.peso <= parseFloat(maxPesoFilter)
                );
            }
        } else if (selectedOfertaType === 'trabajos') {
            filteredResults = filteredResults.filter((item) => item.tipoOferta.trim().toUpperCase() === 'TRABAJO');
            console.log("Ofertas tras filtrar por trabajos:", filteredResults);
            if (minExperienceFilter !== "") {
                if (parseInt(minExperienceFilter) === 5) {
                    filteredResults = filteredResults.filter((item) => item.experiencia >= 5 && item.experiencia <= 9);
                } else if (parseInt(minExperienceFilter) === 10) {
                    filteredResults = filteredResults.filter((item) => item.experiencia >= 10);
                } else {
                    filteredResults = filteredResults.filter((item) => item.experiencia === parseInt(minExperienceFilter));
                }
            }

            // Salary Filter
            if (minSalaryFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.sueldo >= parseFloat(minSalaryFilter)
                );
            }
        }

        // Sort: Promoted items come first
        filteredResults.sort((a, b) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0));

        setFilteredData(filteredResults);
        console.log('Datos filtrados:', filteredResults);

        const newUrl = `${window.location.pathname}?query=${encodeURIComponent(query)}`;
        window.history.pushState({}, '', newUrl);
    };


    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.webContainer}>
                <View style={styles.mainContent}>
                    {/* Filters and Search Bar Card */}
                    <View style={styles.filtersCard}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar ofertas por título..."
                                value={searchQuery}
                                onChangeText={(text) => setSearchQuery(text)}
                                onSubmitEditing={() => handleSearch()}
                            />
                            <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
                                <Text style={styles.searchButtonText}>Buscar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.ofertaTypeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.ofertaTypeButton,
                                    selectedOfertaType === 'trabajos' && styles.ofertaTypeButtonActive,
                                ]}
                                onPress={() => setSelectedOfertaType('trabajos')}
                            >
                                <Text style={styles.ofertaTypeButtonText}>Generales</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.ofertaTypeButton,
                                    selectedOfertaType === 'cargas' && styles.ofertaTypeButtonActive,
                                ]}
                                onPress={() => setSelectedOfertaType('cargas')}
                            >
                                <Text style={styles.ofertaTypeButtonText}>Cargas</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedOfertaType === 'cargas' && (
                            <View style={styles.filtersContainer}>
                                {/* Origen Filter */}
                                <Text style={styles.filterLabel}>Origen:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Ciudad o región"
                                    value={origenFilter}
                                    onChangeText={setOrigenFilter}
                                />

                                {/* Destino Filter */}
                                <Text style={styles.filterLabel}>Destino:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Ciudad o región"
                                    value={destinoFilter}
                                    onChangeText={setDestinoFilter}
                                />

                                {/* Peso Mínimo Filter */}
                                <Text style={styles.filterLabel}>Peso Mínimo (kg):</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Ej: 100"
                                    value={minPesoFilter}
                                    onChangeText={setMinPesoFilter}
                                    keyboardType="numeric"
                                />

                                {/* Peso Máximo Filter */}
                                <Text style={styles.filterLabel}>Peso Máximo (kg):</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Ej: 1000"
                                    value={maxPesoFilter}
                                    onChangeText={setMaxPesoFilter}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}

                        {selectedOfertaType === 'trabajos' && (
                            <View style={styles.filtersContainer}>

                                {/* Minimum Experience Dropdown */}
                                <Text style={styles.filterLabel}>Experiencia Mínima:</Text>
                                <Picker
                                    selectedValue={minExperienceFilter}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setMinExperienceFilter(itemValue)}
                                >
                                    <Picker.Item label="Cualquier experiencia" value="" />
                                    <Picker.Item label="0 años de experiencia" value="0" />
                                    <Picker.Item label="1 año de experiencia" value="1" />
                                    <Picker.Item label="2 años de experiencia" value="2" />
                                    <Picker.Item label="3 años de experiencia" value="3" />
                                    <Picker.Item label="4 años de experiencia" value="4" />
                                    <Picker.Item label="5 años de experiencia" value="5" />
                                    <Picker.Item label="10 años de experiencia" value="10" />
                                </Picker>


                                {/* Salary Range Slider */}
                                <Text style={styles.filterLabel}>Salario Mínimo {minSalaryFilter}€ :</Text>
                                <Slider
                                    style={styles.rangeSlider}
                                    minimumValue={0}
                                    maximumValue={10000} // Adjust based on your data
                                    step={10}
                                    minimumTrackTintColor={colors.primary} // Color of the filled part of the track
                                    maximumTrackTintColor="#ccc"          // Color of the empty part of the track
                                    thumbTintColor={colors.secondary}
                                    onValueChange={(value: number) => {
                                        setMinSalaryFilter(value.toString());
                                    }}
                                />
                            </View>
                        )}
                    </View>

                    {/* Offer Cards Section */}
                    <View style={styles.offersSection}>
                        {filteredData.map((item) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.card,
                                    item.promoted && styles.promotedCard // Add blue border if promoted
                                ]}
                            >
                                {item.promoted && (
                                    <View style={styles.patrocinadoBadge}>
                                        <Text style={styles.patrocinadoText}>PATROCINADO</Text>
                                    </View>
                                )}

                                <Image source={DefaultLogo} style={styles.companyLogo} resizeMode="contain" />
                                <View style={{ width: "30%" }}>
                                    <Text style={styles.offerTitle}>{item.titulo}</Text>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text style={styles.offerDetailsTagType}>{item.tipoOferta}</Text>
                                        <Text style={styles.offerDetailsTagLicense}>{item.licencia.replace(/_/g, '+')}</Text>
                                        <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={styles.localizacion}>|</Text>
                                            <MaterialIcons name="location-on" size={20} color="#696969" />
                                            <Text style={styles.localizacion}>{item.localizacion}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.offerInfo}>{item.notas}</Text>
                                </View>
                                <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
                                <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/${item.id}`)}>
                                    <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
                                    <Text style={styles.buttonText}>Ver Detalles</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        paddingTop: '8%',
        backgroundColor: colors.lightGray,
    },
    webContainer: {
        flex: 1,
        backgroundColor: colors.lightGray,
        alignItems: 'center',
    },
    mainContent: {
        width: '80%',
        flexDirection: 'row',
    },
    filtersCard: {
        width: '30%',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 20,
        marginRight: 20,
        height: 450,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
        gap: 10,
        marginBottom: '8%',
    },
    searchInput: {
        flexBasis: '70%',
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    searchButton: {
        flexBasis: '25%',
        minWidth: 80,
        paddingVertical: 10,
        backgroundColor: colors.primary,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    ofertaTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    ofertaTypeButton: {
        flex: 1, // Equal width for both buttons
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    ofertaTypeButtonActive: {
        backgroundColor: colors.primary,
    },
    ofertaTypeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    filtersContainer: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    filterInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    offersSection: {
        width: '70%', // Offers take 70% of the 70% width
    },
    card: {
        backgroundColor: colors.white,
        padding: 20,
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderColor: "red",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    companyLogo: {
        height: 90,
        width: 120,
        marginRight: 10,
        marginLeft: -10,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
        color: colors.secondary
    },
    offerDetailsTagType: {
        fontSize: 9,
        backgroundColor: colors.primary,
        color: colors.white,
        borderRadius: 10,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 2,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "700",
    },
    offerDetailsTagLicense: {
        fontSize: 9,
        backgroundColor: colors.secondary,
        borderRadius: 10,
        color: colors.white,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 3,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "bold",
    },
    offerDetailsTagExperience: {
        fontSize: 9,
        borderColor: colors.primary,
        borderWidth: 2,
        borderRadius: 10,
        color: colors.primary,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 2,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "bold",
    },
    offerInfo: {
        fontSize: 12,
        color: "gray",
        marginTop: 5,
    },
    offerSueldo: {
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "right",
        paddingLeft: 3,
        color: colors.secondary,
        textAlignVertical: "center",
        width: "35%",
        alignSelf: "center"
    },

    promotedCard: {
        borderWidth: 2,
        borderColor: colors.secondary, // Blue border for promoted offers
    },
    patrocinadoBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: colors.secondary,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    patrocinadoText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
    button: {
        backgroundColor: colors.primary,
        color: colors.white,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: "2%",
        marginTop: 4,
        flexDirection: "row",
        height: 40,
        width: 150,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        color: colors.white,
        fontWeight: "bold"
    },
    detailsIcon: {
        color: colors.white,
        alignSelf: "center",
        marginLeft: 3,
        marginTop: 3,
        marginRight: 5,
    },
    localizacion: {
        fontSize: 15,
        color: "#696969",
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    filterOptionButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        margin: 5,
    },
    filterOptionButtonActive: {
        backgroundColor: colors.primary,
    },
    filterOptionButtonText: {
        color: '#333',
        fontSize: 14,
    },
    slider: {
        width: '100%',
        marginBottom: 10,
    },
    sliderValue: {
        textAlign: 'center',
        fontSize: 14,
        color: colors.secondary,
    },
    rangeSliderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    rangeSliderLabel: {
        fontSize: 14,
        color: colors.secondary,
    },
    rangeSlider: {
        width: '100%',
        marginBottom: 20,
        color: colors.primary,
    },
    picker: {
        height: 40,
        borderColor: colors.secondary,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#fff',
    },

    sliderContainer: {
        marginBottom: 20,
    },
    customMarker: {
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        height: 15,
        width: 15,
        borderRadius: 10,
        backgroundColor: colors.primary,
    },
    sliderValueText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
        marginTop: 5,
    },
    filterInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40, // Altura fija para el contenedor
        marginBottom: '8%',
        marginHorizontal: '0%',
        width: '100%',
    },

    filterIcon: {
        marginLeft: 10,
        marginRight: 5,
        marginBottom: 3,
    },

});