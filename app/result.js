import { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import Pill from '../src/components/Pill';
import useIdentifyStore from '../src/stores/identifyStore';
import useCaptureStore from '../src/stores/captureStore';
import useIntentStore from '../src/stores/intentStore';

export default function ResultScreen() {
  const router = useRouter();
  const result = useIdentifyStore((s) => s.result);
  const photoUri = useCaptureStore((s) => s.photoUri);
  const { type, preference, setType, setPreference } = useIntentStore();

  useEffect(() => {
    if (result && result.confidence < 0.6) {
      router.replace('/clarify');
    }
  }, [result]);

  if (!result || result.confidence < 0.6) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={
          <Text style={styles.wordmark}>CarLens</Text>
        }
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.thumbnail} />
        )}

        <Text style={styles.identifiedLabel}>IDENTIFIED</Text>
        <Text style={styles.partName}>{result.partName}</Text>

        <View style={styles.confidenceRow}>
          <View style={styles.confidenceDot} />
          <Text style={styles.confidenceText}>High confidence</Text>
        </View>

        <View style={styles.rule} />

        {result.alternatives?.length > 0 && (
          <>
            <Text style={styles.alsoLabel}>Also possibly:</Text>
            {result.alternatives.map((alt, i) => (
              <Text key={i} style={styles.altText}>{alt.partName}</Text>
            ))}
            <View style={styles.rule} />
          </>
        )}

        <Text style={styles.sectionHeading}>What are you looking for?</Text>

        <View style={styles.pillsGrid}>
          <View style={styles.pillRow}>
            <Pill
              label="Replacement"
              selected={type === 'replacement'}
              onPress={() => setType('replacement')}
            />
            <Pill
              label="Upgrade"
              selected={type === 'upgrade'}
              onPress={() => setType('upgrade')}
            />
          </View>
          <View style={styles.pillRow}>
            <Pill
              label="OEM-Style"
              selected={preference === 'oem_style'}
              onPress={() => setPreference('oem_style')}
            />
            <Pill
              label="Aftermarket"
              selected={preference === 'aftermarket'}
              onPress={() => setPreference('aftermarket')}
            />
          </View>
        </View>

        <PrimaryButton
          label="See parts →"
          variant="filled"
          fullWidth
          onPress={() => router.push('/results')}
          style={styles.cta}
          labelStyle={styles.ctaLabel}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  wordmark: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
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
  identifiedLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: tokens.spacing.lg,
  },
  partName: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.display * 1.2,
    marginTop: tokens.spacing.xs,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.primary,
  },
  confidenceText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  rule: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginVertical: tokens.spacing.lg,
  },
  alsoLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  altText: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.6,
  },
  sectionHeading: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.lg,
  },
  pillsGrid: {
    gap: tokens.spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  cta: {
    marginTop: tokens.spacing.xxl,
    borderRadius: tokens.radius.pill,
    paddingVertical: tokens.spacing.lg,
  },
  ctaLabel: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
    letterSpacing: 0.3,
  },
});
