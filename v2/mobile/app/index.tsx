import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.text}>Loading Pitgo...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/customer/" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  text: {
    marginTop: 16,
    color: '#e0e0e0',
    fontSize: 16,
  },
});
