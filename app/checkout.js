import { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import useCartStore from '../src/stores/cartStore';
import useCheckoutStore from '../src/stores/checkoutStore';
import TopBar from '../src/components/TopBar';

const fmt = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function VisaBadge() {
  return (
    <View style={styles.visaBadge}>
      <Text style={styles.visaText}>VISA</Text>
    </View>
  );
}

function SectionCard({ children }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function CardHeader({ title, linkLabel, onLinkPress }) {
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Pressable onPress={onLinkPress} hitSlop={8}>
        <Text style={styles.cardLink}>{linkLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const tax = useCartStore((s) => s.tax);
  const total = useCartStore((s) => s.total);

  const address = useCheckoutStore((s) => s.address);
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const placing = useCheckoutStore((s) => s.placing);
  const order = useCheckoutStore((s) => s.order);
  const placeOrder = useCheckoutStore((s) => s.placeOrder);

  useEffect(() => {
    if (order) {
      router.replace(`/order-confirmation?id=${order.id}`);
    }
  }, [order]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        title="Checkout"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ship to */}
        <SectionCard>
          <CardHeader
            title="Ship to"
            linkLabel="Edit"
            onLinkPress={() => console.log('Edit address')}
          />
          <Text style={styles.addressName}>{address.name}</Text>
          <Text style={styles.addressLine}>{address.line1}</Text>
          <Text style={styles.addressLine}>
            {address.city}, {address.state} {address.zip}
          </Text>
        </SectionCard>

        {/* Payment */}
        <SectionCard>
          <CardHeader
            title="Payment"
            linkLabel="Change"
            onLinkPress={() => console.log('Change payment')}
          />
          <View style={styles.paymentRow}>
            <VisaBadge />
            <Text style={styles.paymentLabel}>
              Visa ending in {paymentMethod.last4}
            </Text>
          </View>
        </SectionCard>

        {/* Order summary */}
        <SectionCard>
          <Text style={[styles.cardTitle, { marginBottom: tokens.spacing.md }]}>
            Order summary
          </Text>

          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{ uri: item.imageUri }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemSub} numberOfLines={1}>
                  {item.fitment ?? item.supplier}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{fmt(item.price ?? 0)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated tax</Text>
            <Text style={styles.summaryValue}>{fmt(tax)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmt(total)}</Text>
          </View>
        </SectionCard>

        {/* Apple Pay button */}
        <TouchableOpacity
          style={[styles.applePayBtn, placing && styles.btnDisabled]}
          activeOpacity={0.85}
          disabled={placing}
          onPress={() => placeOrder(items)}
        >
          {placing ? (
            <ActivityIndicator size="small" color={tokens.colors.white} />
          ) : (
            <View style={styles.applePayInner}>
              <Text style={styles.applePayText}>Pay with </Text>
              <FontAwesome name="apple" size={17} color={tokens.colors.white} />
              <Text style={styles.applePayText}> Pay</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Pay with card */}
        <TouchableOpacity
          style={styles.cardBtn}
          activeOpacity={0.8}
          onPress={() => console.log('Pay with card')}
        >
          <Text style={styles.cardBtnLabel}>Pay with card</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          By completing this purchase you agree to CarLens Terms of Service and Privacy Policy.
          All sales are final. Shipping times are estimates and may vary. Tax calculated based on
          delivery address.
        </Text>
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
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxxl,
  },

  // Cards
  sectionCard: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  cardTitle: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  cardLink: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },

  // Address
  addressName: {
    fontFamily: tokens.fonts.sansBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  addressLine: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.sm * 1.6,
  },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.xs,
  },
  visaBadge: {
    width: 38,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#1A1F71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontFamily: tokens.fonts.sansBold,
    fontSize: 9,
    color: tokens.colors.white,
    letterSpacing: 0.5,
  },
  paymentLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },

  // Order summary items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface,
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  itemSub: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginVertical: tokens.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  summaryLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  summaryValue: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  totalLabel: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    fontStyle: 'italic',
    color: tokens.colors.text,
  },
  totalValue: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },

  // Buttons
  applePayBtn: {
    height: 52,
    backgroundColor: tokens.colors.black,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  applePayInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applePayText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
    letterSpacing: 0.2,
  },
  cardBtn: {
    height: 52,
    borderWidth: 1.5,
    borderColor: tokens.colors.primary,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.lg,
  },
  cardBtnLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.primary,
  },

  // Legal
  legal: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: tokens.fontSize.xs * 1.7,
  },
});
