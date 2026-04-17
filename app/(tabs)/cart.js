import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../../src/theme/tokens';
import useCartStore from '../../src/stores/cartStore';
import TopBar from '../../src/components/TopBar';
import PrimaryButton from '../../src/components/PrimaryButton';

const fmt = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function CartItem({ item }) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <View style={styles.itemRow}>
      <Image
        source={{ uri: item.imageUri }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemSupplier}>{item.supplier}</Text>
        <Text style={styles.itemPrice}>{fmt(item.price ?? 0)}</Text>
        <View style={styles.stepperRow}>
          <View style={styles.stepper}>
            <Pressable
              onPress={() =>
                item.qty === 1 ? removeItem(item.id) : updateQty(item.id, item.qty - 1)
              }
              hitSlop={8}
              style={styles.stepBtn}
            >
              <Feather
                name={item.qty === 1 ? 'trash-2' : 'minus'}
                size={14}
                color={tokens.colors.text}
              />
            </Pressable>
            <Text style={styles.stepQty}>{item.qty}</Text>
            <Pressable
              onPress={() => updateQty(item.id, item.qty + 1)}
              hitSlop={8}
              style={styles.stepBtn}
            >
              <Feather name="plus" size={14} color={tokens.colors.text} />
            </Pressable>
          </View>
          <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
            <Text style={styles.removeLink}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.empty}>
      <Feather name="shopping-cart" size={40} color={tokens.colors.border} strokeWidth={1} />
      <Text style={styles.emptyHeadline}>Your cart is empty</Text>
      <Text style={styles.emptySub}>Add parts to see them here.</Text>
      <PrimaryButton
        label="Find a Part"
        onPress={() => router.push('/camera')}
        style={{ marginTop: tokens.spacing.lg }}
      />
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const tax = useCartStore((s) => s.tax);
  const total = useCartStore((s) => s.total);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="user" size={22} color={tokens.colors.text} />}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.push('/profile')}
      />

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.cartTitle}>Cart</Text>
              <Text style={styles.cartCount}>({items.length} {items.length === 1 ? 'item' : 'items'})</Text>
            </View>

            {/* Item list */}
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {/* Order summary */}
            <View style={styles.divider} />
            <View style={styles.summary}>
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
            </View>
          </ScrollView>

          {/* Sticky checkout */}
          <View style={styles.checkoutBar}>
            <PrimaryButton
              label="Checkout"
              onPress={() => router.push('/checkout')}
              fullWidth
              labelStyle={styles.checkoutLabel}
            />
          </View>
        </>
      )}
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
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: tokens.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  cartTitle: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.display * 1.1,
  },
  cartCount: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    gap: tokens.spacing.md,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface,
  },
  itemBody: {
    flex: 1,
    gap: tokens.spacing.xs,
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.4,
  },
  itemSupplier: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  itemPrice: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    gap: tokens.spacing.md,
  },
  stepBtn: {
    padding: tokens.spacing.xs,
  },
  stepQty: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    minWidth: 18,
    textAlign: 'center',
  },
  removeLink: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginHorizontal: tokens.spacing.xl,
    marginVertical: tokens.spacing.md,
  },
  summary: {
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  summaryValue: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  totalLabel: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
  totalValue: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
  checkoutBar: {
    backgroundColor: tokens.colors.bg,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    padding: tokens.spacing.md,
  },
  checkoutLabel: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  emptyHeadline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
    marginTop: tokens.spacing.md,
  },
  emptySub: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
  },
});
