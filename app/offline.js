import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import EmptyState from '../src/components/EmptyState';

export default function OfflineScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
      />
      <EmptyState
        icon="cloud-off"
        title="You're offline"
        subtitle="Check your connection and try again."
        primaryLabel="Retry"
        onPrimaryPress={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  wordmark: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.primary,
  },
});
