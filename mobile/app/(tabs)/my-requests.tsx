import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Clock, CheckCircle, XCircle, Play, Package } from "lucide-react-native";
import { api, setAuthToken } from "@/src/lib/api";
import { colors, spacing, radius, typography } from "@/src/lib/theme";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Aberto", color: "#F59E0B", icon: Clock },
  accepted: { label: "Aceito", color: "#3B82F6", icon: CheckCircle },
  in_progress: { label: "Em Andamento", color: "#8B5CF6", icon: Play },
  completed: { label: "Concluído", color: "#10B981", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "#EF4444", icon: XCircle },
};

type Request = {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  distance_km?: number;
};

export default function MyRequestsScreen() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await api.get("/requests");
      setRequests(res.data?.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  // Initial load
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Polling every 10s for live status updates
  useEffect(() => {
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const renderItem = ({ item }: { item: Request }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
    const Icon = config.icon;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
            <Icon size={12} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleDateString("pt-BR")}
          </Text>
        </View>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Package size={48} color={colors.border} />
      <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
      <Text style={styles.emptySubtitle}>
        Crie seu primeiro pedido e encontre um prestador perto de você
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)/create-request")}
      >
        <Text style={styles.emptyButtonText}>Criar pedido</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hero}>Meus pedidos</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push("/(tabs)/create-request")}
        >
          <Text style={styles.newButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  hero: { ...typography.title, color: colors.text },
  newButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  newButtonText: { ...typography.caption, color: colors.white, fontWeight: "700" },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  emptyList: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  time: { fontSize: 11, color: colors.textMuted },
  cardCategory: { ...typography.subtitle, color: colors.text, marginBottom: 4 },
  cardDesc: { ...typography.body, color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: { ...typography.subtitle, color: colors.text, marginTop: spacing.lg },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
  },
  emptyButtonText: { ...typography.caption, color: colors.white, fontWeight: "700" },
});
