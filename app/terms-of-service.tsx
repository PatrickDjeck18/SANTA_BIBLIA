import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as RNStatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { FileText, Scale, Users, Shield, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';

const { width } = Dimensions.get('window');

export default function TermsOfServiceScreen() {
  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar style="dark" />
      <BackgroundGradient>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ModernHeader
            title="Términos de Servicio"
            variant="simple"
            showBackButton={true}
            showReaderButton={false}
            onBackPress={handleBack}
            readerText="Términos de Servicio. Acuerdo de usuario y términos de servicio. Conoce tus derechos y responsabilidades al usar Santa Biblia."
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction Card */}
          <View style={styles.introCard}>
            <LinearGradient
              colors={['#F8FAFC', '#F1F5F9']}
              style={styles.introGradient}
            >
              <View style={styles.introHeader}>
                <View style={styles.introIcon}>
                  <FileText size={32} color={Colors.primary[600]} />
                </View>
                <View style={styles.introContent}>
                  <Text style={styles.introTitle}>Términos de Servicio</Text>
                  <Text style={styles.introSubtitle}>
                    Última actualización: {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.introText}>
                ¡Bienvenido a Santa Biblia! Estos Términos de Servicio rigen el uso de nuestra aplicación de compañerismo espiritual. Al usar nuestro servicio, aceptas estos términos.
              </Text>
            </LinearGradient>
          </View>

          {/* Acceptance of Terms */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CheckCircle size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Aceptación de Términos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Al acceder o usar Santa Biblia, aceptas estar sujeto a estos Términos de Servicio y nuestra Política de Privacidad. Si no estás de acuerdo con estos términos, por favor no uses nuestro servicio.
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Debes tener al menos 13 años para usar nuestro servicio</Text>
                <Text style={styles.listItem}>• Eres responsable de mantener la seguridad de tu cuenta</Text>
                <Text style={styles.listItem}>• Aceptas proporcionar información precisa</Text>
                <Text style={styles.listItem}>• Entiendes que estos términos pueden ser actualizados</Text>
              </View>
            </View>
          </View>

          {/* Service Description */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Users size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Descripción del Servicio</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Santa Biblia es una aplicación de compañerismo espiritual que proporciona:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Planes de lectura bíblica y herramientas de estudio</Text>
                <Text style={styles.listItem}>• Diario de oración y funciones de seguimiento</Text>
                <Text style={styles.listItem}>• Interpretación de sueños con asistencia de IA</Text>
                <Text style={styles.listItem}>• Seguimiento de ánimo y perspectivas espirituales</Text>
                <Text style={styles.listItem}>• Cuestionarios bíblicos y contenido educativo</Text>
                <Text style={styles.listItem}>• Funciones comunitarias y compartir</Text>
              </View>
            </View>
          </View>

          {/* User Responsibilities */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Responsabilidades del Usuario</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Como usuario de Santa Biblia, aceptas:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Usar el servicio solo para fines legales</Text>
                <Text style={styles.listItem}>• Respetar a otros usuarios y mantener una conducta apropiada</Text>
                <Text style={styles.listItem}>• No compartir contenido inapropiado u ofensivo</Text>
                <Text style={styles.listItem}>• Proteger las credenciales de tu cuenta</Text>
                <Text style={styles.listItem}>• Reportar cualquier problema de seguridad inmediatamente</Text>
                <Text style={styles.listItem}>• Cumplir con todas las leyes y regulaciones aplicables</Text>
              </View>
            </View>
          </View>

          {/* Prohibited Uses */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <AlertTriangle size={24} color={Colors.warning[600]} />
              </View>
              <Text style={styles.sectionTitle}>Usos Prohibidos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                No puedes usar Santa Biblia para:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Actividades ilegales o propósitos dañinos</Text>
                <Text style={styles.listItem}>• Acoso, abuso o intimidación</Text>
                <Text style={styles.listItem}>• Difundir desinformación o falsas enseñanzas</Text>
                <Text style={styles.listItem}>• Intentar hackear o comprometer la seguridad</Text>
                <Text style={styles.listItem}>• Uso comercial sin permiso</Text>
                <Text style={styles.listItem}>• Violar derechos de propiedad intelectual</Text>
              </View>
            </View>
          </View>

          {/* Intellectual Property */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Scale size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Propiedad Intelectual</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Santa Biblia y su contenido están protegidos por leyes de propiedad intelectual:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Somos dueños de la app, software y contenido original</Text>
                <Text style={styles.listItem}>• El texto bíblico se usa bajo licencias apropiadas</Text>
                <Text style={styles.listItem}>• Conservas la propiedad de tu contenido personal</Text>
                <Text style={styles.listItem}>• Nos otorgas licencia para usar tu contenido para el servicio</Text>
                <Text style={styles.listItem}>• No puedes copiar o redistribuir nuestro contenido</Text>
              </View>
            </View>
          </View>

          {/* Privacy and Data */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Privacidad y Protección de Datos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Estamos comprometidos a proteger tu privacidad y datos espirituales:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Tu contenido espiritual está encriptado y seguro</Text>
                <Text style={styles.listItem}>• Nunca vendemos tu información personal</Text>
                <Text style={styles.listItem}>• Controlas tus datos y puedes exportarlos cuando quieras</Text>
                <Text style={styles.listItem}>• Cumplimos con GDPR y otras regulaciones de privacidad</Text>
                <Text style={styles.listItem}>• Ve nuestra Política de Privacidad para más información</Text>
              </View>
            </View>
          </View>

          {/* Service Availability */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CheckCircle size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Disponibilidad del Servicio</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Nos esforzamos por proporcionar un servicio confiable, pero no podemos garantizar:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• 100% de tiempo de actividad o disponibilidad</Text>
                <Text style={styles.listItem}>• Acceso ininterrumpido a todas las funciones</Text>
                <Text style={styles.listItem}>• Compatibilidad con todos los dispositivos</Text>
                <Text style={styles.listItem}>• Respuesta inmediata a problemas técnicos</Text>
              </View>
              <Text style={styles.sectionText}>
                Notificaremos a los usuarios sobre mantenimiento planificado y trabajaremos para resolver problemas prontamente.
              </Text>
            </View>
          </View>

          {/* Limitation of Liability */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <AlertTriangle size={24} color={Colors.warning[600]} />
              </View>
              <Text style={styles.sectionTitle}>Limitación de Responsabilidad</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Santa Biblia se proporciona "tal cual" sin garantías:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• No garantizamos resultados espirituales</Text>
                <Text style={styles.listItem}>• Las interpretaciones de IA son solo para guía</Text>
                <Text style={styles.listItem}>• No somos responsables por daños indirectos</Text>
                <Text style={styles.listItem}>• Nuestra responsabilidad se limita a las tarifas pagadas</Text>
                <Text style={styles.listItem}>• Haces uso del servicio bajo tu propio riesgo</Text>
              </View>
            </View>
          </View>

          {/* Termination */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <AlertTriangle size={24} color={Colors.warning[600]} />
              </View>
              <Text style={styles.sectionTitle}>Terminación de Cuenta</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Podemos terminar o suspender tu cuenta si:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Violas estos términos de servicio</Text>
                <Text style={styles.listItem}>• Participas en actividades prohibidas</Text>
                <Text style={styles.listItem}>• No pagas las tarifas requeridas</Text>
                <Text style={styles.listItem}>• Discontinuamos el servicio</Text>
              </View>
              <Text style={styles.sectionText}>
                Puedes terminar tu cuenta en cualquier momento desde los ajustes de la app.
              </Text>
            </View>
          </View>

          {/* Changes to Terms */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FileText size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Cambios en los Términos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Podemos actualizar estos términos ocasionalmente:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Notificaremos a los usuarios cambios significativos</Text>
                <Text style={styles.listItem}>• El uso continuo constituye aceptación</Text>
                <Text style={styles.listItem}>• Puedes revisar los términos cuando quieras en la app</Text>
                <Text style={styles.listItem}>• Contáctanos si tienes preguntas sobre los cambios</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.contactCard}>
            <LinearGradient
              colors={[Colors.primary[50], Colors.primary[100]]}
              style={styles.contactGradient}
            >
              <View style={styles.contactHeader}>
                <View style={styles.contactIcon}>
                  <FileText size={24} color={Colors.primary[600]} />
                </View>
                <Text style={styles.contactTitle}>Preguntas Sobre Términos</Text>
              </View>
              <Text style={styles.contactText}>
                Si tienes preguntas sobre estos Términos de Servicio, contáctanos:
              </Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactItem}>Email: legal@dailyfaith.me</Text>
                <Text style={styles.contactItem}>Soporte: support@dailyfaith.me</Text>
                <Text style={styles.contactItem}>Tiempo de Respuesta: Típicamente respondemos en 48 horas</Text>
                <Text style={styles.contactItem}>Sitio Web: https://dailyfaith.me</Text>
              </View>
              <Text style={styles.contactFooter}>
                Estos términos se rigen por las leyes aplicables y cualquier disputa se resolverá a través de los canales legales apropiados.
              </Text>
            </LinearGradient>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </BackgroundGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    zIndex: 1000,
    elevation: 4,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Introduction Card
  introCard: {
    marginTop: 20,
    marginBottom: 24,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  introGradient: {
    padding: Spacing.xl,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  introContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  introSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
  },
  introText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    flex: 1,
  },
  sectionContent: {
    gap: Spacing.md,
  },
  sectionText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  listContainer: {
    gap: Spacing.sm,
  },
  listItem: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    paddingLeft: Spacing.sm,
  },

  // Contact Card
  contactCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactGradient: {
    padding: Spacing.xl,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[800],
  },
  contactText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    marginBottom: Spacing.lg,
  },
  contactInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  contactItem: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    fontWeight: Typography.weights.medium,
  },
  contactFooter: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    fontStyle: 'italic',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },

  bottomSpacing: {
    height: 100,
  },
});
