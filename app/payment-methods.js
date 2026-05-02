import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import EmptyState from '../src/components/EmptyState';
import usePaymentStore from '../src/stores/paymentStore';

const BRAND_LABEL = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
};

const BRAND_NAME = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
};

function formatExpiry(month, year) {
  const mm = String(month).padStart(2, '0');
  const yy = String(year).slice(-2);
  return `${mm}/${yy}`;
}

function PaymentMethodCard({ method, onSetDefault, onRemove }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandIconText}>{BRAND_LABEL[method.brand]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {BRAND_NAME[method.brand]} ending in {method.last4}
          </Text>
          <Text style={styles.cardExpiry}>
            Expires {formatExpiry(method.expMonth, method.expYear)}
          </Text>
        </View>
        {method.isDefault ? (
          <View style={styles.defaultPill}>
            <Text style={styles.defaultPillText}>Default</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        {!method.isDefault ? (
          <Pressable onPress={onSetDefault}>
            <Text style={styles.actionPrimary}>Set as default</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onRemove}>
          <Text style={styles.actionDanger}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { methods, fetchMethods, deleteMethod, setDefault } = usePaymentStore();
  const [working, setWorking] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleRemove = (id) => {
    Alert.alert('Remove card?', 'You can add it again later from settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setWorking(true);
          try {
            await deleteMethod(id);
          } catch (e) {
            Alert.alert('Error', e?.message || 'Could not remove card. Please try again.');
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id) => {
    setWorking(true);
    try {
      await setDefault(id);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not update default card. Please try again.');
    } finally {
      setWorking(false);
    }
  };

  const isEmpty = methods.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topTitle}>Payment</Text>}
      />

      {isEmpty ? (
        <EmptyState
          icon="credit-card"
          title="No payment methods"
          subtitle="Add a card to enable in-app purchasing."
          primaryLabel="Add card"
          onPrimaryPress={() => router.push('/add-card')}
        />
      ) : (
        <FlatList
          data={methods}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Payment Methods</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PaymentMethodCard
              method={item}
              onSetDefault={() => !working && handleSetDefault(item.id)}
              onRemove={() => !working && handleRemove(item.id)}
            />
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <PrimaryButton
                label="Add new card"
                variant="outlined"
                fullWidth
                iconLeft={<Feather name="plus" size={18} color={tokens.colors.primary} />}
                onPress={() => router.push('/add-card')}
              />
              <Text style={styles.note}>
                Cards are stored securely with Stripe. CarLens never sees your full card number.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  listContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  header: {
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  headerTitle: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
  },
  card: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    backgroundColor: tokens.colors.bg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 48,
    height: 32,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    fontFamily: tokens.fonts.sansBold,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.text,
  },
  cardInfo: {
    flex: 1,
    marginLeft: tokens.spacing.md,
  },
  cardTitle: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  cardExpiry: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
  },
  defaultPill: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 3,
    borderRadius: tokens.radius.pill,
    marginLeft: tokens.spacing.sm,
  },
  defaultPillText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.white,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.lg,
    marginTop: tokens.spacing.md,
  },
  actionPrimary: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },
  actionDanger: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
  },
  footer: {
    marginTop: tokens.spacing.lg,
  },
  note: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xl,
  },
});
