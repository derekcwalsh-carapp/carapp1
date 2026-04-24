import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../theme/tokens';
import PrimaryButton from './PrimaryButton';
import useUpgradeModalStore from '../stores/upgradeModalStore';
import useSubscriptionStore from '../stores/subscriptionStore';

const FEATURE_CONFIG = {
  lookup_limit: {
    icon: 'camera',
    headline: "You've used all your lookups",
    body: 'Upgrade to get more AI identifications each month.',
    cta: 'Upgrade for more lookups',
    tier: 'Enthusiast',
  },
  vehicle_limit: {
    icon: 'truck',
    headline: 'Garage is full',
    body: 'Upgrade to save more vehicles and keep your whole collection organized.',
    cta: 'Upgrade for more vehicles',
    tier: 'Enthusiast',
  },
  fitment_locked: {
    icon: 'check-circle',
    headline: 'Fitment checking',
    body: 'See if parts fit your exact vehicle before you buy. Available on Enthusiast and above.',
    cta: 'Unlock fitment',
    tier: 'Enthusiast',
  },
  watchlist_locked: {
    icon: 'bell',
    headline: 'Watchlists & alerts',
    body: 'Track prices and get notified when parts drop. Available on Enthusiast and above.',
    cta: 'Unlock watchlists',
    tier: 'Enthusiast',
  },
  price_track_locked: {
    icon: 'trending-down',
    headline: 'Price tracking',
    body: 'Monitor price history and set target prices. Available on Pro.',
    cta: 'Upgrade to Pro',
    tier: 'Pro',
  },
};

export default function UpgradeModal() {
  const { visible, feature, hide } = useUpgradeModalStore();
  const { tier: currentTier } = useSubscriptionStore();
  const router = useRouter();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panelTranslateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(panelTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // TODO: add exit animation (fade out backdrop, slide panel down) before resetting
      backdropOpacity.setValue(0);
      panelTranslateY.setValue(300);
    }
  }, [visible]);

  if (!visible) return null;

  const config = FEATURE_CONFIG[feature] ?? FEATURE_CONFIG.lookup_limit;
  const currentTierLabel = currentTier === 'free' ? 'Free' : 'Enthusiast';

  const handleCta = () => {
    hide();
    router.push('/subscription');
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
      </Animated.View>

      <Animated.View
        style={[styles.panel, { transform: [{ translateY: panelTranslateY }] }]}
      >
        <View style={styles.handle} />

        <Feather
          name={config.icon}
          size={48}
          color={tokens.colors.primary}
          style={styles.icon}
        />

        <Text style={styles.headline}>{config.headline}</Text>

        <Text style={styles.body}>{config.body}</Text>

        <View style={styles.tierRow}>
          <View style={styles.pillMuted}>
            <Text style={styles.pillMutedText}>{currentTierLabel}</Text>
          </View>
          <Feather
            name="arrow-right"
            size={16}
            color={tokens.colors.primary}
            style={styles.tierArrow}
          />
          <View style={styles.pillFilled}>
            <Text style={styles.pillFilledText}>{config.tier}</Text>
          </View>
        </View>

        <PrimaryButton
          label={config.cta}
          onPress={handleCta}
          fullWidth
          style={styles.cta}
          labelStyle={styles.ctaLabel}
        />

        <Pressable onPress={hide} style={styles.notNow}>
          <Text style={styles.notNowText}>Not now</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.bg,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.border,
    marginBottom: tokens.spacing.xl,
  },
  icon: {
    marginBottom: tokens.spacing.lg,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
    maxWidth: 280,
    alignSelf: 'center',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
  },
  pillMuted: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  pillMutedText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  tierArrow: {
    marginHorizontal: tokens.spacing.sm,
  },
  pillFilled: {
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  pillFilledText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.white,
  },
  cta: {
    marginTop: tokens.spacing.lg,
  },
  ctaLabel: {
    fontFamily: tokens.fonts.serifItalic,
  },
  notNow: {
    marginTop: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  notNowText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
});
