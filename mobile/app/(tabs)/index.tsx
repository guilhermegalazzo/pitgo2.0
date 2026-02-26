import { View, Text, StyleSheet, FlatList } from "react-native";
import { Search, MapPin } from "lucide-react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.locationText}>São Paulo, SP</Text>
        </View>
        <Text style={styles.title}>Pitgo</Text>
      </View>
      
      <View style={styles.searchBar}>
        <Search size={20} color="#9CA3AF" />
        <Text style={styles.searchPlaceholder}>O que seu carro precisa hoje?</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Serviços em Destaque</Text>
        <Text style={styles.emptyText}>Carregando catálogo...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 4,
    color: "#4B5563",
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#6D28D9",
  },
  searchBar: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: "#9CA3AF",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
  },
});
