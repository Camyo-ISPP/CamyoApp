import { legalData } from '@/assets/legalData';
import colors from '@/assets/styles/colors';
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WebFooter from '../_components/_layout/WebFooter';

const TermsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
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

          {/* Servicios para usuarios anónimos */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Servicios para usuarios anónimos:</Text>
            {legalData.termsAndConditions.serviceDescription.services.anonymous.map((service, index) => (
              <View key={`anon-${index}`} style={styles.listItem}>
                <Icon name="check" size={16} color="#4CAF50" style={styles.listIcon} />
                <Text style={styles.listText}>{service}</Text>
              </View>
            ))}
          </View>

          {/* Servicios para camioneros */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Servicios para camioneros:</Text>
            {legalData.termsAndConditions.serviceDescription.services.drivers.map((service, index) => (
              <View key={`driver-${index}`} style={styles.listItem}>
                <Icon name="check" size={16} color="#4CAF50" style={styles.listIcon} />
                <Text style={styles.listText}>{service}</Text>
              </View>
            ))}
          </View>

          {/* Servicios para empresas */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Servicios para empresas:</Text>
            {legalData.termsAndConditions.serviceDescription.services.companies.map((service, index) => (
              <View key={`company-${index}`} style={styles.listItem}>
                <Icon name="check" size={16} color="#4CAF50" style={styles.listIcon} />
                <Text style={styles.listText}>{service}</Text>
              </View>
            ))}
          </View>

          {/* Planes */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Planes de suscripción:</Text>

            <View style={styles.planItem}>
              <Icon name="star-outline" size={18} color="#FFC107" style={styles.planIcon} />
              <Text style={styles.planTitle}>Plan Gratis:</Text>
              <Text style={styles.planDescription}>{legalData.termsAndConditions.serviceDescription.plans.free.description}</Text>
              <Text style={styles.planDescription}>{legalData.termsAndConditions.serviceDescription.plans.free.sponsorship}</Text>
            </View>

            <View style={styles.planItem}>
              <Icon name="star-half" size={18} color="#FFC107" style={styles.planIcon} />
              <Text style={styles.planTitle}>Plan Básico:</Text>
              <Text style={styles.planDescription}>{legalData.termsAndConditions.serviceDescription.plans.basic.description}</Text>
              <Text style={styles.planDescription}>{legalData.termsAndConditions.serviceDescription.plans.basic.sponsorship}</Text>
            </View>

            <View style={styles.planItem}>
              <Icon name="star" size={18} color="#FFC107" style={styles.planIcon} />
              <Text style={styles.planTitle}>Plan Premium:</Text>
              <Text style={styles.planDescription}>{legalData.termsAndConditions.serviceDescription.plans.premium.description}</Text>
              <Text style={styles.planDescription}>{legalData.termsAndConditions.serviceDescription.plans.premium.sponsorship}</Text>
            </View>
          </View>

          {/* Publicidad */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Publicidad:</Text>
            <Text style={styles.sectionContent}>{legalData.termsAndConditions.serviceDescription.advertising}</Text>
          </View>
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
              <Icon name="warning" size={16} color="#FF9800" style={styles.listIcon} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>Responsabilidad de la cuenta:</Text>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.serviceUsage.accountResponsibility}</Text>

          <Text style={styles.subsectionTitle}>Política de uso indebido:</Text>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.serviceUsage.misusePolicy}</Text>
        </View>

        {/* Cuentas de Usuario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account-circle" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.termsAndConditions.userAccounts.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.userAccounts.content}</Text>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Información adicional para camioneros:</Text>
            {legalData.termsAndConditions.userAccounts.additionalInfo.driver.map((info, index) => (
              <View key={`driver-info-${index}`} style={styles.listItem}>
                <Icon name="chevron-right" size={16} color="#0b4f6c" style={styles.listIcon} />
                <Text style={styles.listText}>{info}</Text>
              </View>
            ))}
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Información adicional para empresas:</Text>
            {legalData.termsAndConditions.userAccounts.additionalInfo.company.map((info, index) => (
              <View key={`company-info-${index}`} style={styles.listItem}>
                <Icon name="chevron-right" size={16} color="#0b4f6c" style={styles.listIcon} />
                <Text style={styles.listText}>{info}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionContent}>{legalData.termsAndConditions.userAccounts.dataAssumption}</Text>
        </View>

        {/* Pagos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="payment" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.termsAndConditions.payments.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.payments.content}</Text>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.payments.paymentProvider}</Text>
        </View>

        {/* Propiedad Intelectual */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="copyright" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.termsAndConditions.intellectualProperty.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.intellectualProperty.content}</Text>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.intellectualProperty.license}</Text>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.intellectualProperty.userContent}</Text>
        </View>

        {/* Cancelación */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cancel" size={20} color="#0b4f6c" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{legalData.termsAndConditions.cancellation.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.cancellation.content}</Text>
          <Text style={styles.sectionContent}>{legalData.termsAndConditions.cancellation.duration}</Text>
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
    height: '1%',
    backgroundColor: colors.white,
    width: '100%',
  },
  subsection: {
    marginTop: 15,
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
  },
  subsectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0b4f6c',
    marginBottom: 10,
  },
  planItem: {
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
  },
  planIcon: {
    marginRight: 8,
    marginBottom: 5,
  },
  planTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0b4f6c',
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
    marginLeft: 26,
    marginBottom: 3,
  },
});

export default TermsScreen;