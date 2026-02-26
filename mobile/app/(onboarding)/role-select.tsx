import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { User, Wrench, ChevronRight } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/src/lib/theme";

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.brand}>Pitgo</Text>
        <Text style={styles.hero}>Vamos começar.</Text>
        <Text style={styles.subtitle}>
          Escolha como você quer usar o Pitgo
        </Text>
      </View>

      <View style={styles.cardSection}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => router.push("/(onboarding)/customer-form")}
        >
          <View style={styles.cardIcon}>
            <User size={28} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Sou Cliente</Text>
            <Text style={styles.cardDescription}>
              Quero contratar serviços automotivos perto de mim
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => router.push("/(onboarding)/provider-form")}
        >
          <View style={[styles.cardIcon, styles.cardIconAlt]}>
            <Wrench size={28} color={colors.white} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Sou Prestador</Text>
            <Text style={styles.cardDescription}>
              Quero oferecer meus serviços e receber clientes
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Você poderá alterar isso depois nas configurações
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: spacing.xxl,
  },
  brand: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  hero: {
    ...typography.hero,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  cardSection: {
    gap: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconAlt: {
    backgroundColor: colors.primary,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 2,
  },
  cardDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: "center",
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
