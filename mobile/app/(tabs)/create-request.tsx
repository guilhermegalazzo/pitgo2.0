import { useState, useEffect } from "react";
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
  Send,
  Tag,
  FileText,
  MapPin,
  Camera,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { api, setAuthToken } from "@/src/lib/api";
import { colors, spacing, radius, typography } from "@/src/lib/theme";

const requestSchema = z.object({
  category: z.string().min(2, "Selecione uma categoria"),
  description: z.string().min(10, "Descreva o serviço com pelo menos 10 caracteres"),
  latitude: z.number(),
  longitude: z.number(),
});

const CATEGORIES = [
  "Lavagem",
  "Polimento",
  "Mecânica",
  "Elétrica",
  "Pneus",
  "Pintura",
  "Outro",
];

export default function CreateRequestScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "",
    description: "",
    latitude: -23.5505,
    longitude: -46.6333,
    photoURL: "",
  });

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const result = requestSchema.safeParse(form);
    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Dados inválidos",
        text2: result.error.errors[0].message,
        position: "top",
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post("/requests", {
        service_id: "default",
        category: form.category,
        description: form.description,
        latitude: form.latitude,
        longitude: form.longitude,
        photo_url: form.photoURL,
        scheduled_at: new Date().toISOString(),
        total_price: 0,
      });

      Toast.show({
        type: "success",
        text1: "Pedido criado!",
        text2: "Aguardando um prestador aceitar...",
        position: "top",
        topOffset: 60,
      });

      setTimeout(() => router.push("/(tabs)/my-requests"), 600);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao criar pedido",
        text2: err?.response?.data?.message || "Tente novamente",
        position: "top",
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.category.length >= 2 && form.description.length >= 10;

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
        <View style={styles.headerSection}>
          <Text style={styles.hero}>Novo pedido</Text>
          <Text style={styles.subtitle}>
            Descreva o que seu carro precisa e encontraremos o melhor prestador
          </Text>
        </View>

        <View style={styles.formSection}>
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

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>DESCRIÇÃO</Text>
            <View style={[styles.inputContainer, { alignItems: "flex-start" }]}>
              <FileText
                size={18}
                color={colors.textMuted}
                style={{ marginTop: 16 }}
              />
              <TextInput
                style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]}
                placeholder="Descreva detalhes do serviço, modelo do carro, etc..."
                placeholderTextColor={colors.textMuted}
                value={form.description}
                onChangeText={(v) => updateField("description", v)}
                multiline
                maxLength={500}
              />
            </View>
            <Text style={styles.charCount}>{form.description.length}/500</Text>
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>LOCALIZAÇÃO</Text>
            <View style={styles.locationCard}>
              <MapPin size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>Localização atual</Text>
                <Text style={styles.locationSub}>
                  {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </Text>
              </View>
              <View style={styles.locationBadge}>
                <Text style={styles.locationBadgeText}>GPS</Text>
              </View>
            </View>
          </View>

          {/* Photo (optional) */}
          <View style={styles.field}>
            <Text style={styles.label}>FOTO (OPCIONAL)</Text>
            <TouchableOpacity style={styles.photoButton} activeOpacity={0.8}>
              <Camera size={22} color={colors.textMuted} />
              <Text style={styles.photoText}>Tirar foto do veículo</Text>
            </TouchableOpacity>
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
            <View style={styles.submitContent}>
              <Send size={18} color={colors.white} />
              <Text style={styles.submitText}>Enviar pedido</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: 40 },
  headerSection: { marginBottom: spacing.xl },
  hero: { ...typography.hero, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  formSection: { gap: spacing.lg, marginBottom: spacing.xl },
  field: {},
  label: { ...typography.label, color: colors.textSecondary, fontSize: 10, marginBottom: spacing.sm },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: { backgroundColor: "#6D28D915", borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: "700" },
  charCount: { textAlign: "right", marginTop: spacing.xs, fontSize: 11, color: colors.textMuted },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  locationTitle: { ...typography.caption, color: colors.text, fontWeight: "600" },
  locationSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  locationBadge: {
    backgroundColor: "#10B98120",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  locationBadgeText: { fontSize: 10, fontWeight: "800", color: colors.success },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  photoText: { ...typography.caption, color: colors.textMuted },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: { opacity: 0.4, shadowOpacity: 0 },
  submitContent: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  submitText: { ...typography.subtitle, color: colors.white },
});
