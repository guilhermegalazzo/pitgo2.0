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
import { ChevronLeft, User, Phone, MapPin } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { api, setAuthToken } from "@/src/lib/api";
import { colors, spacing, radius, typography } from "@/src/lib/theme";

const customerSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .regex(/^[\d\s\-\(\)\+]+$/, "Formato de telefone inválido"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
});

export default function CustomerFormScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    phone: "",
    city: "",
    state: "",
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const result = customerSchema.safeParse(form);
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
        type: "customer",
        first_name: form.firstName,
        last_name: "",
        phone: form.phone,
        city: form.city,
        state: form.state,
      });

      Toast.show({
        type: "success",
        text1: "Perfil criado!",
        text2: "Bem-vindo ao Pitgo 🚗",
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
    form.firstName.length >= 2 &&
    form.phone.length >= 10 &&
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
            <Text style={styles.stepText}>CLIENTE</Text>
          </View>
          <Text style={styles.hero}>Seus dados.</Text>
          <Text style={styles.subtitle}>
            Precisamos de algumas informações para encontrar serviços perto de
            você
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.field}>
            <Text style={styles.label}>NOME</Text>
            <View style={styles.inputContainer}>
              <User size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.textMuted}
                value={form.firstName}
                onChangeText={(v) => updateField("firstName", v)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>TELEFONE</Text>
            <View style={styles.inputContainer}>
              <Phone size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.textMuted}
                value={form.phone}
                onChangeText={(v) => updateField("phone", v)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

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
            <Text style={styles.submitText}>Criar minha conta</Text>
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
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  stepText: { ...typography.label, color: colors.primary, fontSize: 10 },
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
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  row: { flexDirection: "row", gap: spacing.md },
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
  submitText: { ...typography.subtitle, color: colors.white },
});
