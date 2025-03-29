import { legalData } from '@/assets/legalData';
import colors from '@/assets/styles/colors';
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TermsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    <View style={styles.whiteTransition} />
      <View style={styles.header}>
        <Icon name="description" size={30} color="#0b4f6c" style={styles.headerIcon} />
        <Text style={styles.title}>Términos y Condiciones</Text>
      </View>
      
      <View style={styles.lastUpdatedContainer}>
        <Icon name="update" size={16} color="#757575" />
        <Text style={styles.lastUpdated}> Última actualización: {legalData.lastUpdated}</Text>
      </View>
      
      {/* Introducción */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="info" size={20} color="#0b4f6c" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{legalData.termsAndConditions.introduction.title}</Text>
        </View>
        <Text style={styles.sectionContent}>{legalData.termsAndConditions.introduction.content}</Text>
      </View>
      
      {/* Definiciones */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="menu-book" size={20} color="#0b4f6c" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{legalData.termsAndConditions.definitions.title}</Text>
        </View>
        {legalData.termsAndConditions.definitions.items.map((item, index) => (
          <View key={index} style={styles.definitionItem}>
            <Text style={styles.term}>{item.term}:</Text>
            <Text style={styles.definition}>{item.definition}</Text>
          </View>
        ))}
      </View>
      
      {/* Descripción del Servicio */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="business-center" size={20} color="#0b4f6c" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{legalData.termsAndConditions.serviceDescription.title}</Text>
        </View>
        <Text style={styles.sectionContent}>{legalData.termsAndConditions.serviceDescription.content}</Text>
      </View>
      
      {/* Uso del Servicio */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="build" size={20} color="#0b4f6c" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{legalData.termsAndConditions.serviceUsage.title}</Text>
        </View>
        <Text style={styles.sectionContent}>{legalData.termsAndConditions.serviceUsage.content}</Text>
        {legalData.termsAndConditions.serviceUsage.commitments.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Icon name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
      
      {/* Contacto */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="contact-mail" size={20} color="#0b4f6c" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{legalData.contact.title}</Text>
        </View>
        <Text style={styles.sectionContent}>{legalData.contact.content}</Text>
        <View style={styles.contactItem}>
          <Icon name="email" size={18} color="#0b4f6c" style={styles.contactIcon} />
          <Text style={styles.contactEmail}>{legalData.contact.email}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 50,
    paddingVertical: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.secondary,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    marginBottom: 10,
  },
  definitionItem: {
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
  },
  term: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0b4f6c',
    marginBottom: 5,
  },
  definition: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  listText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: '#0b4f6c',
  },
  whiteTransition: {
    height: '3%',
    backgroundColor: colors.white,
    width: '100%',
  },
});

export default TermsScreen;