import { router } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, Image, Animated, Dimensions, ScrollView, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from "@expo/vector-icons";
const CompanyLogo = require('frontend/assets/images/camyo.png');

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function BuscarOfertas({ searchQuery: externalSearchQuery = '' }: { searchQuery?: string }) {
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
    const [selectedOfertaType, setSelectedOfertaType] = useState<'cargas' | 'generales' | null>(null);
    const [dateFilter, setDateFilter] = useState('');
    const [minWeightFilter, setMinWeightFilter] = useState('');
    const [maxWeightFilter, setMaxWeightFilter] = useState('');
    const [minExperienceFilter, setMinExperienceFilter] = useState('');
    const [minSalaryFilter, setMinSalaryFilter] = useState('');
    const [maxSalaryFilter, setMaxSalaryFilter] = useState('');

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

    const fetchData = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/ofertas`);
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
            if (dateFilter) {
                filteredResults = filteredResults.filter((item) => item.fecha === dateFilter);
            }
            if (minWeightFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.peso >= parseFloat(minWeightFilter)
                );
            }
            if (maxWeightFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.peso <= parseFloat(maxWeightFilter)
                );
            }
        } else if (selectedOfertaType === 'generales') {
            filteredResults = filteredResults.filter((item) => item.tipoOferta === 'TRABAJO');
            if (minExperienceFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.experiencia >= parseFloat(minExperienceFilter)
                );
            }
            if (minSalaryFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.sueldo >= parseFloat(minSalaryFilter)
                );
            }
            if (maxSalaryFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.sueldo <= parseFloat(maxSalaryFilter)
                );
            }
        }

        setFilteredData(filteredResults);

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
                                    selectedOfertaType === 'generales' && styles.ofertaTypeButtonActive,
                                ]}
                                onPress={() => setSelectedOfertaType('generales')}
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
                                <Text style={styles.filterLabel}>Fecha:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="YYYY-MM-DD"
                                    value={dateFilter}
                                    onChangeText={(text) => setDateFilter(text)}
                                />
                                <Text style={styles.filterLabel}>Peso Mínimo:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Mínimo"
                                    keyboardType="numeric"
                                    value={minWeightFilter}
                                    onChangeText={(text) => setMinWeightFilter(text)}
                                />
                                <Text style={styles.filterLabel}>Peso Máximo:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Máximo"
                                    keyboardType="numeric"
                                    value={maxWeightFilter}
                                    onChangeText={(text) => setMaxWeightFilter(text)}
                                />
                            </View>
                        )}

                        {selectedOfertaType === 'generales' && (
                            <View style={styles.filtersContainer}>
                                <Text style={styles.filterLabel}>Experiencia Mínima:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Años"
                                    keyboardType="numeric"
                                    value={minExperienceFilter}
                                    onChangeText={(text) => setMinExperienceFilter(text)}
                                />
                                <Text style={styles.filterLabel}>Salario Mínimo:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Mínimo"
                                    keyboardType="numeric"
                                    value={minSalaryFilter}
                                    onChangeText={(text) => setMinSalaryFilter(text)}
                                />
                                <Text style={styles.filterLabel}>Salario Máximo:</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Máximo"
                                    keyboardType="numeric"
                                    value={maxSalaryFilter}
                                    onChangeText={(text) => setMaxSalaryFilter(text)}
                                />
                            </View>
                        )}
                    </View>

                    {/* Offer Cards Section */}
                    <View style={styles.offersSection}>
                        {filteredData.map((item) => (
                            <View key={item.id} style={styles.card}>
                                <Image source={CompanyLogo} style={styles.companyLogo} />
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
                                <TouchableOpacity style={styles.button} onPress={() => router.replace(`/oferta/${item.id}`)}>
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
        paddingTop: '6%', // Margin top for the entire content
        backgroundColor: colors.lightGray,
    },
    webContainer: {
        flex: 1,
        backgroundColor: colors.lightGray,
        alignItems: 'center',
    },
    mainContent: {
        width: '70%', // Occupies 70% of the screen width
        flexDirection: 'row',
    },
    filtersCard: {
        width: '30%', // Filters take 30% of the 70% width
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 20,
        marginRight: 20,
        height: 400, // Altura mínima fija para la tarjeta de filtros
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
        marginBottom: 20,
        marginHorizontal: 5,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    searchButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 5,
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
        width: 90,
        marginRight: 10,
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
});