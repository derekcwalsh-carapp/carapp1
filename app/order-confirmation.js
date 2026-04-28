import { useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import PrimaryButton from '../src/components/PrimaryButton';
import useCartStore from '../src/stores/cartStore';
import useCheckoutStore from '../src/stores/checkoutStore';
import useAuthStore from '../src/stores/authStore';


const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getArrivalLabel() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return `Arrives ${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { id: paramId } = useLocalSearchParams();
  const order = useCheckoutStore((s) => s.order);
  const resetCheckout = useCheckoutStore((s) => s.reset);
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const clearedRef = useRef(false);

  const orderId = paramId ?? order?.id;
  const displayOrderLabel = order?.orderNumber ?? orderId;
  const items = order?.items ?? [];
  const thumbnails = items.slice(0, 3);

  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      clear();
      resetCheckout();
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Feather name="check-circle" size={80} color={tokens.colors.primary} />

        <Text style={styles.headline}>Order confirmed</Text>

        <Text style={styles.subline}>
          {"We've emailed your receipt to\n"}
          {user?.email ?? 'your email'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.orderNumber}>Order #{displayOrderLabel ?? 'CL-00000'}</Text>
          <Text style={styles.arrival}>{getArrivalLabel()}</Text>

          {thumbnails.length > 0 && (
            <View style={styles.thumbRow}>
              {thumbnails.map((item, i) => (
                <Image
                  key={item.id ?? i}
                  source={{ uri: item.image }}
                  style={styles.thumb}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="View order"
            variant="filled"
            fullWidth
            onPress={() => router.replace(`/order/${orderId}`)}
          />
          <PrimaryButton
            label="Back to Home"
            variant="outlined"
            fullWidth
            style={styles.secondBtn}
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xxxl,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    textAlign: 'center',
    marginTop: tokens.spacing.lg,
    lineHeight: tokens.fontSize.display * 1.2,
  },
  subline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
    lineHeight: tokens.fontSize.md * 1.5,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginTop: tokens.spacing.xl,
    alignItems: 'center',
  },
  orderNumber: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  arrival: {
    fontFamily: tokens.fonts.sansBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginTop: tokens.spacing.xs,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface,
  },
  actions: {
    width: '100%',
    marginTop: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  secondBtn: {
    marginTop: tokens.spacing.sm,
  },
});
