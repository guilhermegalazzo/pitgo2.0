import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { MapPin, Navigation, CheckCircle, Inbox } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { api, setAuthToken } from "@/src/lib/api";
import { colors, spacing, radius, typography } from "@/src/lib/theme";

type AvailableRequest = {
  id: string;
  category: string;
  description: string;
  distance_km: number;
  created_at: string;
  latitude: number;
  longitude: number;
};

export default function AvailableRequestsScreen() {
  const { getToken } = useAuth();
  const [requests, setRequests] = useState<AvailableRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchAvailable = useCallback(async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await api.get("/requests/available", {
        params: { lat: -23.5505, lng: -46.6333, radius_km: 25 },
      });
      setRequests(res.data?.requests || []);
    } catch (err) {
      console.error("Failed to fetch available requests", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  // Polling every 15s
  useEffect(() => {
    const interval = setInterval(fetchAvailable, 15000);
    return () => clearInterval(interval);
  }, [fetchAvailable]);

  const handleAccept = (requestId: string) => {
    Alert.alert(
      "Aceitar pedido",
      "Tem certeza que deseja aceitar este serviço?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceitar",
          onPress: async () => {
            setAcceptingId(requestId);
            try {
              const token = await getToken();
              setAuthToken(token);
              await api.post(`/requests/${requestId}/accept`);
              Toast.show({
                type: "success",
                text1: "Pedido aceito!",
                text2: "Dirija-se ao local do cliente",
                position: "top",
                topOffset: 60,
              });
              // Remove from list
              setRequests((prev) => prev.filter((r) => r.id !== requestId));
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Erro ao aceitar",
                text2: err?.response?.data?.message || "Pedido já foi aceito",
                position: "top",
                topOffset: 60,
              });
            } finally {
              setAcceptingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: AvailableRequest }) => {
    const isAccepting = acceptingId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.distanceBadge}>
            <Navigation size={12} color={colors.primary} />
            <Text style={styles.distanceText}>
              {item.distance_km?.toFixed(1) || "?"} km
            </Text>
          </View>
        </View>

        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={styles.locationText}>
              {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.acceptButton, isAccepting && styles.acceptButtonLoading]}
            onPress={() => handleAccept(item.id)}
            disabled={isAccepting}
            activeOpacity={0.85}
          >
            {isAccepting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <CheckCircle size={16} color={colors.white} />
                <Text style={styles.acceptText}>Aceitar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Inbox size={48} color={colors.border} />
      <Text style={styles.emptyTitle}>Sem pedidos por perto</Text>
      <Text style={styles.emptySubtitle}>
        Nenhum pedido aberto na sua região no momento. Volte em breve!
      </Text>
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
        <Text style={styles.hero}>Disponíveis</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{requests.length}</Text>
        </View>
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
            onRefresh={() => { setRefreshing(true); fetchAvailable(); }}
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
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  hero: { ...typography.title, color: colors.text },
  countBadge: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { fontSize: 13, fontWeight: "800", color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  emptyList: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: "#6D28D915",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  categoryText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#6D28D910",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  distanceText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  cardDesc: { ...typography.body, color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: spacing.md },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 11, color: colors.textMuted },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  acceptButtonLoading: { opacity: 0.6 },
  acceptText: { ...typography.caption, color: colors.white, fontWeight: "700" },
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
});
