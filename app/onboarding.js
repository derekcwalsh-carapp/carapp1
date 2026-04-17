import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tokens from '../src/theme/tokens';
import PrimaryButton from '../src/components/PrimaryButton';

const SLIDES = [
  {
    key: '1',
    image: require('../assets/onboarding/slide1.png'),
    headline: 'Photograph any part.',
    subline: 'Point your iPhone at a part on your classic car and identify it in seconds.',
  },
  {
    key: '2',
    image: require('../assets/onboarding/slide2.png'),
    headline: 'Know it fits.',
    subline:
      'We check every part against your saved vehicle so you never buy the wrong one.',
  },
  {
    key: '3',
    image: require('../assets/onboarding/slide3.png'),
    headline: 'Buy it in the app.',
    subline:
      'Compare options, confirm fitment, and check out with Apple Pay — no tabs, no hunting.',
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter();

  const imageHeight = height * 0.52;

  function handleScrollEnd(e) {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  }

  function handleContinue() {
    if (index < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      router.replace('/sign-in');
    }
  }

  function handleSkip() {
    router.replace('/sign-in');
  }

  function renderSlide({ item }) {
    return (
      <View style={{ width }}>
        <Image source={item.image} style={[styles.image, { height: imageHeight, width }]} resizeMode="cover" />
        <View style={styles.textBlock}>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.subline}>{item.subline}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.carousel}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        <PrimaryButton
          label={index < SLIDES.length - 1 ? 'Continue' : 'Get started'}
          onPress={handleContinue}
          variant="filled"
          fullWidth
        />

        {index < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipWrap} activeOpacity={0.7}>
            <Text style={styles.skipLabel}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  carousel: {
    flex: 1,
  },
  image: {
    // width and height set dynamically
  },
  textBlock: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.display * 1.15,
    textAlign: 'left',
  },
  subline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    lineHeight: tokens.fontSize.md * 1.55,
    textAlign: 'left',
  },
  bottom: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.bg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: tokens.colors.primary,
  },
  dotInactive: {
    backgroundColor: tokens.colors.border,
  },
  skipWrap: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xs,
  },
  skipLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
  },
});
