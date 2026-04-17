import { View, Text, ScrollView, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import TopBar from '../src/components/TopBar';
import tokens from '../src/theme/tokens';
import useIdentifyStore from '../src/stores/identifyStore';
import useCaptureStore from '../src/stores/captureStore';

const OPTIONS = [
  { label: 'Carburetor', icon: 'settings' },
  { label: 'Throttle body', icon: 'wind' },
  { label: 'Intake manifold', icon: 'box' },
];

export default function ClarifyScreen() {
  const router = useRouter();
  const photoUri = useCaptureStore((s) => s.photoUri);
  const result = useIdentifyStore((s) => s.result);
  const resolveWith = useIdentifyStore((s) => s.resolveWith);
  const resetCapture = useCaptureStore((s) => s.reset);

  const headline = result?.clarifyQuestion ?? 'Is this a carburetor?';

  function handleOption(label) {
    resolveWith(label);
    router.replace('/result');
  }

  function handleRetake() {
    resetCapture();
    router.replace('/camera');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        title="CarLens"
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
        )}

        <Text style={styles.eyebrow}>WE'RE NOT SURE</Text>

        <Text style={styles.headline}>{headline}</Text>

        <Text style={styles.subline}>
          It could also be a throttle body or an intake manifold. Help us narrow it down.
        </Text>

        <View style={styles.optionStack}>
          {OPTIONS.map(({ label, icon }) => (
            <Pressable
              key={label}
              style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
              onPress={() => handleOption(label)}
            >
              <Feather name={icon} size={24} color={tokens.colors.primary} style={styles.optionIcon} />
              <Text style={styles.optionLabel}>{label}</Text>
              <Feather name="chevron-right" size={18} color={tokens.colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.retakeRow, pressed && styles.retakeRowPressed]}
          onPress={handleRetake}
        >
          <Text style={styles.retakeLabel}>None of these — retake photo</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.sm,
    marginTop: tokens.spacing.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: tokens.colors.surface,
  },
  eyebrow: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: tokens.spacing.lg,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.display * 1.2,
    marginTop: tokens.spacing.sm,
  },
  subline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    lineHeight: tokens.fontSize.md * 1.55,
    marginTop: tokens.spacing.md,
  },
  optionStack: {
    marginTop: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.lg,
  },
  optionCardPressed: {
    backgroundColor: tokens.colors.surface,
  },
  optionIcon: {
    marginRight: tokens.spacing.md,
  },
  optionLabel: {
    flex: 1,
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  retakeRow: {
    alignItems: 'center',
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    marginTop: tokens.spacing.sm,
  },
  retakeRowPressed: {
    backgroundColor: tokens.colors.surface,
  },
  retakeLabel: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
  },
});
