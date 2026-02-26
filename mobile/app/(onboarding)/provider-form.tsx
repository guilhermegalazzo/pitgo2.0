import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  ChevronLeft,
  Briefcase,
  Building2,
  Tag,
  MapPin,
  Radius,
  FileText,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { api, setAuthToken } from "@/src/lib/api";
import { colors, spacing, radius as rad, typography } from "@/src/lib/theme";

const providerSchema = z.object({
  providerType: z.enum(["autonomo", "empresa"]),
  publicName: z.string().min(3, "Nome público deve ter pelo menos 3 caracteres"),
  category: z.string().min(2, "Categoria é obrigatória"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  radius: z.number().min(1, "Raio mínimo de 1 km"),
  bio: z.string().max(200, "Bio deve ter no máximo 200 caracteres").optional(),
});

type ProviderType = "autonomo" | "empresa";

const CATEGORIES = [
  "Estética Automotiva",
  "Mecânica",
  "Elétrica",
  "Pintura & Chaparia",
  "Pneus & Rodas",
  "Outro",
];

export default function ProviderFormScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    providerType: "autonomo" as ProviderType,
    publicName: "",
    category: "",
    city: "",
    state: "",
    radius: 10,
    bio: "",
  });

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const result = providerSchema.safeParse(form);
    if (!result.success) {
      const firstError = result.error.errors[0];
      Toast.show({
        type: "error",
        text1: "Dados inválidos",
        text2: firstError.message,
        position: "top",
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post("/profiles", {
        type: "provider",
        first_name: form.publicName,
        last_name: "",
        phone: "",
        provider_details: {
          categories: [form.category],
          service_area: form.radius,
          bio: form.bio,
          provider_type: form.providerType,
          city: form.city,
          state: form.state,
        },
      });

      Toast.show({
        type: "success",
        text1: "Perfil criado!",
        text2: "Bem-vindo ao time Pitgo 🔧",
        position: "top",
        topOffset: 60,
      });

      setTimeout(() => router.replace("/"), 800);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao criar perfil",
        text2: err?.response?.data?.message || "Tente novamente",
        position: "top",
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.publicName.length >= 3 &&
    form.category.length >= 2 &&
    form.city.length >= 2 &&
    form.state.length >= 2;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={20} color={colors.text} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>PRESTADOR</Text>
          </View>
          <Text style={styles.hero}>Seu negócio.</Text>
          <Text style={styles.subtitle}>
            Configure seu perfil para receber clientes na sua região
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* Provider Type Toggle */}
          <View style={styles.field}>
            <Text style={styles.label}>TIPO</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  form.providerType === "autonomo" && styles.toggleActive,
                ]}
                onPress={() => updateField("providerType", "autonomo")}
              >
                <Briefcase
                  size={18}
                  color={
                    form.providerType === "autonomo"
                      ? colors.white
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.toggleText,
                    form.providerType === "autonomo" && styles.toggleTextActive,
                  ]}
                >
                  Autônomo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  form.providerType === "empresa" && styles.toggleActive,
                ]}
                onPress={() => updateField("providerType", "empresa")}
              >
                <Building2
                  size={18}
                  color={
                    form.providerType === "empresa"
                      ? colors.white
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.toggleText,
                    form.providerType === "empresa" && styles.toggleTextActive,
                  ]}
                >
                  Empresa
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Public Name */}
          <View style={styles.field}>
            <Text style={styles.label}>NOME PÚBLICO</Text>
            <View style={styles.inputContainer}>
              <Briefcase size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Como clientes vão te encontrar"
                placeholderTextColor={colors.textMuted}
                value={form.publicName}
                onChangeText={(v) => updateField("publicName", v)}
              />
            </View>
          </View>

          {/* Category Chips */}
          <View style={styles.field}>
            <Text style={styles.label}>CATEGORIA</Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    form.category === cat && styles.chipActive,
                  ]}
                  onPress={() => updateField("category", cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.category === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 2 }]}>
              <Text style={styles.label}>CIDADE</Text>
              <View style={styles.inputContainer}>
                <MapPin size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="São Paulo"
                  placeholderTextColor={colors.textMuted}
                  value={form.city}
                  onChangeText={(v) => updateField("city", v)}
                />
              </View>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>ESTADO</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { paddingLeft: 0 }]}
                  placeholder="SP"
                  placeholderTextColor={colors.textMuted}
                  value={form.state}
                  onChangeText={(v) => updateField("state", v)}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          {/* Radius Slider */}
          <View style={styles.field}>
            <View style={styles.sliderHeader}>
              <Text style={styles.label}>RAIO DE ATENDIMENTO</Text>
              <View style={styles.radiusBadge}>
                <Text style={styles.radiusValue}>{form.radius} km</Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={form.radius}
              onValueChange={(v: number) => updateField("radius", v)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 km</Text>
              <Text style={styles.sliderLabel}>50 km</Text>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.label}>BIO CURTA</Text>
            <View style={[styles.inputContainer, { alignItems: "flex-start" }]}>
              <FileText
                size={18}
                color={colors.textMuted}
                style={{ marginTop: 16 }}
              />
              <TextInput
                style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
                placeholder="Conte um pouco sobre seus serviços..."
                placeholderTextColor={colors.textMuted}
                value={form.bio}
                onChangeText={(v) => updateField("bio", v)}
                multiline
                maxLength={200}
              />
            </View>
            <Text style={styles.charCount}>{form.bio.length}/200</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isValid || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.submitText}>Começar a atender</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: 40 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  backText: { ...typography.caption, color: colors.text },
  headerSection: { marginBottom: spacing.xl },
  stepBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: rad.full,
    marginBottom: spacing.md,
  },
  stepText: { ...typography.label, color: colors.primary, fontSize: 10 },
  hero: { ...typography.hero, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  formSection: { gap: spacing.lg, marginBottom: spacing.xl },
  field: {},
  label: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: rad.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  row: { flexDirection: "row", gap: spacing.md },
  toggleRow: { flexDirection: "row", gap: spacing.sm },
  toggleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: rad.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  toggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  toggleText: { ...typography.caption, color: colors.textSecondary },
  toggleTextActive: { color: colors.white, fontWeight: "700" },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: rad.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: "700" },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  radiusBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: rad.full,
  },
  radiusValue: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
  },
  slider: { width: "100%", height: 40 },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  charCount: {
    textAlign: "right",
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: rad.lg,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: { opacity: 0.4, shadowOpacity: 0 },
  submitText: { ...typography.subtitle, color: colors.white },
});
