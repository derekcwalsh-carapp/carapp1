import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Switch,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import SectionHeader from '../src/components/SectionHeader';
import useNotificationStore from '../src/stores/notificationStore';
import useAuthStore from '../src/stores/authStore';
import useSubscriptionStore from '../src/stores/subscriptionStore';
import useUpgradeModalStore from '../src/stores/upgradeModalStore';

function ToggleRow({ icon, label, description, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <Feather name={icon} size={20} color={tokens.colors.textMuted} style={styles.rowIcon} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: tokens.colors.border, true: tokens.colors.primary }}
        thumbColor={tokens.colors.white}
        ios_backgroundColor={tokens.colors.border}
      />
    </View>
  );
}

function LockedRow({ icon, label, description, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Feather name={icon} size={20} color={tokens.colors.textMuted} style={styles.rowIcon} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <View style={styles.lockBadge}>
        <Feather name="lock" size={12} color={tokens.colors.textMuted} />
        <Text style={styles.lockLabel}>Enthusiast+</Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { preferences, fetchPreferences, updatePreference } = useNotificationStore();
  const user = useAuthStore((s) => s.user);
  const tier = useSubscriptionStore((s) => s.tier);
  const showUpgrade = useUpgradeModalStore((s) => s.show);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const emailLabel = user?.email ?? 'your email';
  const priceDropLocked = tier === 'free';

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topBarTitle}>Notifications</Text>}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <SectionHeader title="Push Notifications" variant="smallCaps" />
        </View>
        <Text style={styles.helper}>These appear on your iPhone's lock screen.</Text>

        <ToggleRow
          icon="package"
          label="Order updates"
          description="Shipped, delivered"
          value={preferences.orderUpdates}
          onValueChange={(v) => updatePreference('orderUpdates', v)}
        />
        <ToggleRow
          icon="camera"
          label="Identification complete"
          description="When your AI lookup finishes"
          value={preferences.identifyComplete}
          onValueChange={(v) => updatePreference('identifyComplete', v)}
        />
        <ToggleRow
          icon="alert-circle"
          label="Lookup limit warning"
          description="At 80% of monthly usage"
          value={preferences.lookupWarning}
          onValueChange={(v) => updatePreference('lookupWarning', v)}
        />

        <View style={[styles.sectionHeader, styles.sectionHeaderEmail]}>
          <SectionHeader title="Email Notifications" variant="smallCaps" />
        </View>
        <Text style={styles.helper}>Sent to {emailLabel}.</Text>

        <ToggleRow
          icon="mail"
          label="Subscription reminders"
          description="Renewal and cancellation notices"
          value={preferences.subscriptionEmail}
          onValueChange={(v) => updatePreference('subscriptionEmail', v)}
        />
        {priceDropLocked ? (
          <LockedRow
            icon="trending-down"
            label="Price drop alerts"
            description="When a watched part drops in price"
            onPress={() => showUpgrade('watchlist_locked')}
          />
        ) : (
          <ToggleRow
            icon="trending-down"
            label="Price drop alerts"
            description="When a watched part drops in price"
            value={preferences.priceDropEmail}
            onValueChange={(v) => updatePreference('priceDropEmail', v)}
          />
        )}
        <ToggleRow
          icon="star"
          label="Tips & recommendations"
          description="Occasional product picks and features"
          value={preferences.marketingEmail}
          onValueChange={(v) => updatePreference('marketingEmail', v)}
        />

        <Text style={styles.footnote}>
          You can also manage push notifications in your iPhone's Settings app.
        </Text>
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
  sectionHeader: {
    marginTop: tokens.spacing.xl,
  },
  sectionHeaderEmail: {
    marginTop: tokens.spacing.xxl,
  },
  helper: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  },
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  rowIcon: {
    marginRight: tokens.spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  rowDescription: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginTop: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  lockLabel: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
  },
  footnote: {
    marginTop: tokens.spacing.xxl,
    marginBottom: tokens.spacing.xxxl,
    textAlign: 'center',
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
  },
});
