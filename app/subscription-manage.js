import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
  Pressable,
  Animated,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import Card from '../src/components/Card';
import useSubscriptionStore from '../src/stores/subscriptionStore';
import useGarageStore from '../src/stores/garageStore';

const TIER_LABELS = { free: 'Free', enthusiast: 'Enthusiast', pro: 'Pro' };

const TIER_PRICES = {
  free: { monthly: '$0/month', annual: '$0/year' },
  enthusiast: { monthly: '$12.99/month', annual: '$99/year' },
  pro: { monthly: '$17.99/month', annual: '$149/year' },
};

function formatPeriodEnd(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function Rule() {
  return <View style={styles.rule} />;
}

function BillingRow({ iconName, label, rightIconName, onPress }) {
  return (
    <Pressable style={styles.billingRow} onPress={onPress}>
      <Feather name={iconName} size={18} color={tokens.colors.text} style={styles.billingIcon} />
      <Text style={styles.billingLabel}>{label}</Text>
      <Feather name={rightIconName} size={16} color={tokens.colors.textMuted} />
    </Pressable>
  );
}

export default function SubscriptionManageScreen() {
  const {
    tier,
    billingCycle,
    status,
    currentPeriodEnd,
    lookupsUsed,
    lookupsLimit,
    vehicleLimit,
    cancelSubscription,
    openPortal,
    setBillingCycle,
  } = useSubscriptionStore();
  const { vehicles } = useGarageStore();

  const meterAnim = useRef(new Animated.Value(0)).current;
  const meterFill = lookupsLimit > 0 ? lookupsUsed / lookupsLimit : 0;

  useEffect(() => {
    Animated.timing(meterAnim, {
      toValue: meterFill,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, []);

  const isCancelled = status === 'cancelled';
  const isAnnual = billingCycle === 'annual';
  const periodLabel = currentPeriodEnd ? formatPeriodEnd(currentPeriodEnd) : '';
  const tierLabel = TIER_LABELS[tier] ?? tier;
  const priceLabel = TIER_PRICES[tier]?.[billingCycle] ?? '';

  const handleCancelPress = () => {
    Alert.alert(
      'Cancel subscription?',
      "You'll keep access until the end of your billing period.",
      [
        { text: 'Keep plan', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: cancelSubscription },
      ]
    );
  };

  const handleSwitchBilling = () => {
    const next = isAnnual ? 'monthly' : 'annual';
    Alert.alert(
      `Switch to ${next} billing?`,
      `Your plan will update to ${next} billing at next renewal.`,
      [
        { text: 'Nevermind', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            setBillingCycle(next);
            console.log(`[CarLens] Billing cycle → ${next}`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topBarTitle}>Subscription</Text>}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card 1 — Current Plan */}
        <Card padding={tokens.spacing.xl} style={styles.card}>
          <View style={styles.planRow}>
            <Text style={styles.tierName}>{tierLabel}</Text>
            <View style={[styles.statusPill, isCancelled && styles.statusPillCancelled]}>
              <Text style={[styles.statusText, isCancelled && styles.statusTextCancelled]}>
                {isCancelled ? 'Cancelled' : 'Active'}
              </Text>
            </View>
          </View>
          <Text style={styles.price}>{priceLabel}</Text>
          <Text style={styles.renewal}>
            {isCancelled ? `Access until ${periodLabel}` : `Renews ${periodLabel}`}
          </Text>
        </Card>

        {/* Card 2 — Usage This Period */}
        <Card padding={tokens.spacing.xl} style={styles.card}>
          <Text style={styles.usageTitle}>AI Lookups</Text>
          <View style={styles.meterTrack}>
            <Animated.View
              style={[
                styles.meterFill,
                {
                  width: meterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <View style={styles.meterMeta}>
            <Text style={styles.meterLeft}>
              {lookupsUsed} of {lookupsLimit} used
            </Text>
            <Text style={styles.meterRight}>{lookupsLimit - lookupsUsed} remaining</Text>
          </View>

          <Rule />

          <Text style={styles.usageTitle}>Saved Vehicles</Text>
          <Text>
            <Text style={styles.vehicleCount}>{vehicles.length} of {vehicleLimit}</Text>
            <Text style={styles.vehicleMuted}> vehicles saved</Text>
          </Text>
        </Card>

        {/* Card 3 — Billing */}
        <Card padding={tokens.spacing.xl} style={styles.card}>
          <BillingRow
            iconName="credit-card"
            label="Manage payment method"
            rightIconName="external-link"
            onPress={openPortal}
          />
          <Rule />
          <BillingRow
            iconName="file-text"
            label="Billing history"
            rightIconName="chevron-right"
            onPress={() => {
              console.log('[CarLens] Billing history');
              router.push('/billing-history');
            }}
          />
        </Card>

        {/* Action buttons */}
        <View style={styles.actions}>
          {tier !== 'pro' && (
            <PrimaryButton
              label="Upgrade to Pro"
              variant="filled"
              fullWidth
              labelStyle={styles.upgradeLabel}
              onPress={() => router.push('/subscription')}
            />
          )}
          <PrimaryButton
            label={isAnnual ? 'Switch to monthly' : 'Switch to annual billing'}
            variant="outlined"
            fullWidth
            onPress={handleSwitchBilling}
          />
        </View>

        {/* Cancel / Resubscribe */}
        <View style={styles.footer}>
          {isCancelled ? (
            <Pressable onPress={() => router.push('/subscription')}>
              <Text style={styles.resubscribeText}>Resubscribe</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleCancelPress}>
              <Text style={styles.cancelText}>Cancel subscription</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  card: {
    marginTop: tokens.spacing.lg,
  },

  // Plan card
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
  },
  tierName: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.primary,
  },
  statusPill: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.primary,
  },
  statusPillCancelled: {
    backgroundColor: tokens.colors.surface,
  },
  statusText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.white,
  },
  statusTextCancelled: {
    color: tokens.colors.textMuted,
  },
  price: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  renewal: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },

  // Usage card
  usageTitle: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.md,
  },
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.surface,
    overflow: 'hidden',
  },
  meterFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.primary,
  },
  meterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.sm,
  },
  meterLeft: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  meterRight: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },
  rule: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginVertical: tokens.spacing.md,
  },
  vehicleCount: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  vehicleMuted: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
  },

  // Billing card
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  billingIcon: {
    marginRight: tokens.spacing.md,
  },
  billingLabel: {
    flex: 1,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },

  // Actions
  actions: {
    marginTop: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  upgradeLabel: {
    fontFamily: tokens.fonts.serifItalic,
    color: tokens.colors.white,
  },

  // Footer
  footer: {
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.xxxl,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
  },
  resubscribeText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },
});
