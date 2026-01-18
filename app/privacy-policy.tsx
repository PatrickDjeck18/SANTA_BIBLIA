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
import { ChevronLeft, Shield, Lock, Eye, Database, Mail, Globe } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';

const { width } = Dimensions.get('window');

export default function PrivacyPolicyScreen() {
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
            title="Política de Privacidad"
            variant="simple"
            showBackButton={true}
            showReaderButton={false}
            onBackPress={handleBack}
            readerText="Política de Privacidad. Protección de datos y derechos de privacidad. Aprende cómo protegemos tu información personal y respetamos tu privacidad."
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
                  <Shield size={32} color={Colors.primary[600]} />
                </View>
                <View style={styles.introContent}>
                  <Text style={styles.introTitle}>Política de Privacidad</Text>
                  <Text style={styles.introSubtitle}>
                    Última actualización: {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.introText}>
                En Santa Biblia, estamos comprometidos a proteger tu privacidad y garantizar la seguridad de tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tus datos.
              </Text>
            </LinearGradient>
          </View>

          {/* Information We Collect */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Database size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Información que Recopilamos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, usas nuestros servicios o nos contactas para soporte.
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Información de cuenta (nombre, email, contraseña)</Text>
                <Text style={styles.listItem}>• Contenido espiritual (oraciones, sueños, notas)</Text>
                <Text style={styles.listItem}>• Datos de uso e interacciones con la app</Text>
                <Text style={styles.listItem}>• Información del dispositivo y análisis</Text>
              </View>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Eye size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Cómo Usamos Tu Información</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Usamos tu información para proporcionar, mantener y mejorar nuestros servicios:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Entregar contenido espiritual personalizado</Text>
                <Text style={styles.listItem}>• Proporcionar interpretaciones de sueños con IA</Text>
                <Text style={styles.listItem}>• Enviar recordatorios de oración y notificaciones</Text>
                <Text style={styles.listItem}>• Mejorar la funcionalidad de la app y la experiencia</Text>
                <Text style={styles.listItem}>• Garantizar seguridad y prevenir fraude</Text>
              </View>
            </View>
          </View>

          {/* Data Protection */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Lock size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Protección de Datos y Seguridad</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Implementamos medidas de seguridad estándar para proteger tus datos:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Encriptación de extremo a extremo para datos sensibles</Text>
                <Text style={styles.listItem}>• Almacenamiento seguro en la nube con encriptación</Text>
                <Text style={styles.listItem}>• Auditorías de seguridad regulares y actualizaciones</Text>
                <Text style={styles.listItem}>• Acceso limitado solo a personal autorizado</Text>
                <Text style={styles.listItem}>• Protocolos de transmisión de datos seguros</Text>
              </View>
            </View>
          </View>

          {/* Your Rights */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Tus Derechos de Privacidad</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Tienes los siguientes derechos con respecto a tus datos personales:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Acceder a tus datos personales</Text>
                <Text style={styles.listItem}>• Corregir información inexacta</Text>
                <Text style={styles.listItem}>• Eliminar tu cuenta y datos</Text>
                <Text style={styles.listItem}>• Exportar tu contenido espiritual</Text>
                <Text style={styles.listItem}>• Optar por no participar en el procesamiento</Text>
                <Text style={styles.listItem}>• Retirar el consentimiento en cualquier momento</Text>
              </View>
            </View>
          </View>

          {/* Third-Party Services */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Globe size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Servicios de Terceros</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Podemos usar servicios de terceros para mejorar tu experiencia:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Firebase para autenticación y almacenamiento</Text>
                <Text style={styles.listItem}>• OpenAI para interpretaciones de sueños con IA</Text>
                <Text style={styles.listItem}>• Servicios de análisis para mejora de la app</Text>
                <Text style={styles.listItem}>• Proveedores de almacenamiento en la nube</Text>
              </View>
              <Text style={styles.sectionText}>
                Estos servicios tienen sus propias políticas de privacidad y nos aseguramos de que cumplan con nuestros estándares de seguridad.
              </Text>
            </View>
          </View>

          {/* Data Retention */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Database size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Retención de Datos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Retenemos tus datos solo el tiempo necesario:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Datos de cuenta: Hasta que elimines tu cuenta</Text>
                <Text style={styles.listItem}>• Contenido espiritual: Permanentemente (salvo borrado)</Text>
                <Text style={styles.listItem}>• Datos de análisis: Hasta 2 años</Text>
                <Text style={styles.listItem}>• Comunicaciones de soporte: Hasta 3 años</Text>
              </View>
            </View>
          </View>

          {/* Children's Privacy */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Privacidad de los Niños</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Nuestro servicio no está destinado a niños menores de 13 años. No recopilamos a sabiendas información personal de niños menores de 13 años. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, por favor contáctanos.
              </Text>
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
                  <Mail size={24} color={Colors.primary[600]} />
                </View>
                <Text style={styles.contactTitle}>Contáctenos</Text>
              </View>
              <Text style={styles.contactText}>
                Si tienes alguna pregunta sobre esta Política de Privacidad o nuestras prácticas de datos, por favor contáctanos:
              </Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactItem}>Email: privacy@dailyfaith.me</Text>
                <Text style={styles.contactItem}>Oficial de Protección de Datos: dpo@dailyfaith.me</Text>
                <Text style={styles.contactItem}>Tiempo de Respuesta: Típicamente respondemos en 48 horas</Text>
                <Text style={styles.contactItem}>Dirección Postal: Disponible bajo petición para asuntos legales</Text>
                <Text style={styles.contactItem}>Sitio Web: https://dailyfaith.me</Text>
              </View>
              <Text style={styles.contactFooter}>
                Para residentes de la UE: Tienes derecho a presentar una queja ante tu autoridad local de protección de datos si crees que tus datos han sido procesados ilegalmente.
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
