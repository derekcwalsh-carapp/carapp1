import { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import Pill from '../src/components/Pill';
import useSubscriptionStore from '../src/stores/subscriptionStore';
import usePaymentStore from '../src/stores/paymentStore';

function FeatureRow({ label }) {
  return (
    <View style={styles.featureRow}>
      <Feather name="check" size={16} color={tokens.colors.primary} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

function PriceDisplay({ amount, period }) {
  return (
    <Text style={styles.priceLine}>
      <Text style={styles.priceAmount}>{amount}</Text>
      <Text style={styles.pricePeriod}>{period}</Text>
    </Text>
  );
}

function Rule() {
  return <View style={styles.rule} />;
}

function CurrentPlanButton() {
  return (
    <PrimaryButton
      label="Current plan"
      variant="outlined"
      fullWidth
      disabled
      style={styles.currentPlanBtn}
      labelStyle={styles.currentPlanLabel}
    />
  );
}

const FREE_FEATURES = [
  '5 AI lookups / month',
  '1 saved vehicle',
  'Basic identification',
  'Standard purchase links',
];

const ENTHUSIAST_FEATURES = [
  '50 AI lookups / month',
  '5 saved vehicles',
  'Full identification + fitment',
  'In-app purchasing',
  'Watchlists & alerts',
  'Saved search history',
];

const PRO_FEATURES = [
  'Unlimited AI lookups',
  'Unlimited vehicles',
  'Priority AI + deeper matching',
  'In-app purchasing',
  'Watchlists & alerts',
  'Price tracking',
  'Project garage tools',
];

export default function SubscriptionScreen() {
  const tier = useSubscriptionStore((s) => s.tier);
  const billingCycle = useSubscriptionStore((s) => s.billingCycle);
  const setBillingCycle = useSubscriptionStore((s) => s.setBillingCycle);
  const subscribe = useSubscriptionStore((s) => s.subscribe);
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);
  const paymentMethods = usePaymentStore((s) => s.methods);
  const fetchMethods = usePaymentStore((s) => s.fetchMethods);
  const { handleNextAction } = useStripe();
  const isAnnual = billingCycle === 'annual';
  const [loadingTier, setLoadingTier] = useState(null); // null | 'enthusiast' | 'pro'

  useEffect(() => {
    fetchSubscription();
    fetchMethods();
  }, [fetchSubscription, fetchMethods]);

  const handleCheckout = async (planTier) => {
    if (paymentMethods.length === 0) {
      Alert.alert(
        'No payment method',
        'Please add a card before upgrading.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add card', onPress: () => router.push('/payment-methods') },
        ]
      );
      return;
    }
    setLoadingTier(planTier);
    try {
      const cycle = billingCycle ?? 'monthly';
      const result = await subscribe(planTier, cycle);
      if (result?.requiresAction && result.clientSecret) {
        const { error } = await handleNextAction(result.clientSecret);
        if (error) {
          Alert.alert('Payment failed', error.message);
          return;
        }
        await fetchSubscription();
      }
      router.push('/subscription-manage');
    } catch (e) {
      const msg =
        e?.response?.data?.error?.message ??
        e?.response?.data?.message ??
        e?.message ??
        'Something went wrong.';
      Alert.alert('Subscription error', msg);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topBarTitle}>Choose your plan</Text>}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Billing toggle */}
        <View style={styles.toggleWrapper}>
          <View style={styles.toggleRow}>
            <Pill
              label="Monthly"
              selected={!isAnnual}
              onPress={() => setBillingCycle('monthly')}
            />
            <Pill
              label="Annual"
              selected={isAnnual}
              onPress={() => setBillingCycle('annual')}
            />
          </View>
          {isAnnual && <Text style={styles.savingsLabel}>Save up to 36%</Text>}
        </View>

        {/* Free card */}
        <View style={[styles.card, styles.cardDefault]}>
          <Text style={styles.tierName}>Free</Text>
          <PriceDisplay amount="$0" period=" /forever" />
          <Text style={styles.subLine}>Try the basics</Text>
          <Rule />
          {FREE_FEATURES.map((f) => <FeatureRow key={f} label={f} />)}
          {tier === 'free' && (
            <View style={styles.buttonWrapper}>
              <CurrentPlanButton />
            </View>
          )}
        </View>

        {/* Enthusiast card */}
        <View style={[styles.card, styles.cardEnthusiast]}>
          <View style={styles.popularBadgeContainer}>
            <View style={styles.popularBadgePill}>
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </View>
          </View>
          <Text style={[styles.tierName, styles.tierNamePrimary]}>Enthusiast</Text>
          <PriceDisplay
            amount={isAnnual ? '$99' : '$12.99'}
            period={isAnnual ? ' /year' : ' /month'}
          />
          <Text style={styles.subLine}>For most classic car owners</Text>
          <Rule />
          {ENTHUSIAST_FEATURES.map((f) => <FeatureRow key={f} label={f} />)}
          <View style={styles.buttonWrapper}>
            {tier === 'enthusiast' ? (
              <CurrentPlanButton />
            ) : (
              <PrimaryButton
                label="Upgrade to Enthusiast"
                variant="filled"
                fullWidth
                onPress={() => handleCheckout('enthusiast')}
                disabled={loadingTier !== null}
                loading={loadingTier === 'enthusiast'}
                labelStyle={styles.upgradeLabel}
              />
            )}
          </View>
        </View>

        {/* Pro card */}
        <View style={[styles.card, styles.cardDefault]}>
          <View style={styles.goldAccent} />
          <Text style={styles.tierName}>Pro</Text>
          <PriceDisplay
            amount={isAnnual ? '$149' : '$17.99'}
            period={isAnnual ? ' /year' : ' /month'}
          />
          <Text style={styles.subLine}>For serious builders</Text>
          <Rule />
          {PRO_FEATURES.map((f) => <FeatureRow key={f} label={f} />)}
          <View style={styles.buttonWrapper}>
            {tier === 'pro' ? (
              <CurrentPlanButton />
            ) : (
              <PrimaryButton
                label="Upgrade to Pro"
                variant="outlined"
                fullWidth
                onPress={() => handleCheckout('pro')}
                disabled={loadingTier !== null}
                loading={loadingTier === 'pro'}
                labelStyle={styles.upgradeLabel}
              />
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Cancel anytime. No commitments.</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.compareLink}>Compare all features</Text>
          </Pressable>
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
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },

  // Toggle
  toggleWrapper: {
    alignItems: 'center',
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  savingsLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.primary,
    marginTop: tokens.spacing.sm,
  },

  // Cards
  card: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    overflow: 'visible',
  },
  cardDefault: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  cardEnthusiast: {
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    marginTop: tokens.spacing.lg,
  },

  // Most Popular badge
  popularBadgeContainer: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  popularBadgePill: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
  },
  popularBadgeText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.white,
  },

  // Gold accent
  goldAccent: {
    height: 3,
    width: 40,
    backgroundColor: tokens.colors.gold,
    marginBottom: tokens.spacing.md,
    borderRadius: 2,
  },

  // Card content
  tierName: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  tierNamePrimary: {
    color: tokens.colors.primary,
  },
  priceLine: {
    marginBottom: tokens.spacing.xs,
  },
  priceAmount: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
  },
  pricePeriod: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  subLine: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  rule: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginVertical: tokens.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  featureLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
    marginLeft: tokens.spacing.sm,
  },
  buttonWrapper: {
    marginTop: tokens.spacing.md,
  },
  currentPlanBtn: {
    borderColor: tokens.colors.border,
    opacity: 1,
  },
  currentPlanLabel: {
    color: tokens.colors.textMuted,
  },
  upgradeLabel: {
    fontFamily: tokens.fonts.serifItalic,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.xxxl,
    gap: tokens.spacing.sm,
  },
  footerText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    textAlign: 'center',
  },
  compareLink: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },
});
