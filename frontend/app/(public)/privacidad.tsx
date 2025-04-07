import { legalData } from '@/assets/legalData';
import colors from '@/assets/styles/colors';
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WebFooter from '../_components/_layout/WebFooter';

const PrivacyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Icon name="privacy-tip" size={30} color="#0b4f6c" style={styles.headerIcon} />
          <Text style={styles.title}>Política de Privacidad</Text>
        </View>

        <View style={styles.lastUpdatedContainer}>
          <Icon name="update" size={16} color="#757575" />
          <Text style={styles.lastUpdated}> Última actualización: {legalData.lastUpdated}</Text>
        </View>

        {/* Introducción */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.privacyPolicy.introduction.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.privacyPolicy.introduction.content}</Text>
        </View>

        {/* Alcance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="public" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.privacyPolicy.scope.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.privacyPolicy.scope.content}</Text>
          <View style={styles.subtitleContainer}>
            <Icon name="list-alt" size={18} color="#0b4f6c" style={styles.subtitleIcon} />
            <Text style={styles.subtitle}>Principios del tratamiento de datos:</Text>
          </View>
          {legalData.privacyPolicy.scope.principles.map((principle, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
              <Text style={styles.listText}>{principle}</Text>
            </View>
          ))}
        </View>

        {/* Tratamiento */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="settings" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.privacyPolicy.processing.title}</Text>
          </View>

          <View style={styles.subtitleContainer}>
            <Icon name="how-to-reg" size={18} color="#0b4f6c" style={styles.subtitleIcon} />
            <Text style={styles.subtitle}>{legalData.privacyPolicy.processing.consent.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.privacyPolicy.processing.consent.content}</Text>

          <View style={styles.subtitleContainer}>
            <Icon name="child-care" size={18} color="#0b4f6c" style={styles.subtitleIcon} />
            <Text style={styles.subtitle}>{legalData.privacyPolicy.processing.minors.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.privacyPolicy.processing.minors.content}</Text>

          <View style={styles.subtitleContainer}>
            <Icon name="security" size={18} color="#0b4f6c" style={styles.subtitleIcon} />
            <Text style={styles.subtitle}>{legalData.privacyPolicy.processing.confidentiality.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.privacyPolicy.processing.confidentiality.content}</Text>
        </View>

        {/* Derechos de los Usuarios */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="gavel" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.privacyPolicy.userRights.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.privacyPolicy.userRights.content}</Text>
          {legalData.privacyPolicy.userRights.rights.map((right, index) => (
            <View key={index} style={styles.rightItem}>
              <View style={styles.rightHeader}>
                <Icon name="star" size={16} color="#FFC107" style={styles.rightIcon} />
                <Text style={styles.rightTitle}>{right.name}:</Text>
              </View>
              <Text style={styles.rightDescription}>{right.description}</Text>
            </View>
          ))}
        </View>

        {/* Seguridad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="lock" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.privacyPolicy.security.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.privacyPolicy.security.content}</Text>
          <View style={styles.subtitleContainer}>
            <Icon name="warning" size={18} color="#0b4f6c" style={styles.subtitleIcon} />
            <Text style={styles.subtitle}>{legalData.privacyPolicy.security.breachProtocol.title}</Text>
          </View>
          {legalData.privacyPolicy.security.breachProtocol.steps.map((step, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="arrow-forward" size={16} color="#0b4f6c" style={styles.listIcon} />
              <Text style={styles.listText}>{step}</Text>
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
      </View>
      <WebFooter />
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
    paddingVertical: 50,
    marginLeft:"7%",
    marginRight:"7%"
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
    color: '#0b4f6c',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    marginBottom: 10,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitleIcon: {
    marginRight: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0b4f6c',
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
  rightItem: {
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rightIcon: {
    marginRight: 8,
  },
  rightTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0b4f6c',
  },
  rightDescription: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
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
    height: '2%',
    backgroundColor: colors.white,
    width: '100%',
  },
});

export default PrivacyScreen;