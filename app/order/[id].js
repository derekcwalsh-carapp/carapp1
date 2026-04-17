import { View, Text, ScrollView, Image, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../../src/theme/tokens';
import TopBar from '../../src/components/TopBar';
import Card from '../../src/components/Card';
import useOrdersStore from '../../src/stores/ordersStore';

const STEPS = ['Placed', 'Paid', 'Shipped', 'Delivered'];

function stepsDone(status) {
  if (status === 'delivered') return 4;
  if (status === 'shipped') return 3;
  if (status === 'paid') return 2;
  return 1; // processing / default
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusTimeline({ status }) {
  const done = stepsDone(status);

  return (
    <View style={styles.timeline}>
      <View style={styles.timelineInner}>
        <View style={styles.timelineLine} />
        {STEPS.map((label, i) => {
          const completed = i < done;
          const current = i === done && done < 4;
          return (
            <View key={label} style={styles.timelineStep}>
              <View
                style={[
                  styles.node,
                  completed && styles.nodeCompleted,
                  current && styles.nodeCurrent,
                  !completed && !current && styles.nodeUpcoming,
                ]}
              >
                {completed && <Feather name="check" size={14} color={tokens.colors.white} />}
              </View>
              <Text style={styles.nodeLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ItemRow({ item }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemThumbWrap}>
        {item.thumbnailUri ? (
          <Image source={{ uri: item.thumbnailUri }} style={styles.itemThumb} resizeMode="contain" />
        ) : (
          <View style={[styles.itemThumb, styles.itemThumbPlaceholder]} />
        )}
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        {item.supplier ? <Text style={styles.itemSupplier}>{item.supplier}</Text> : null}
        <Text style={styles.itemPrice}>
          ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
        </Text>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>{value}</Text>
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const byId = useOrdersStore((s) => s.byId);
  const order = byId(id);

  if (!order) {
    return (
      <SafeAreaView style={styles.root}>
        <TouchableOpacity onPress={() => router.back()} style={styles.fallbackBack}>
          <Feather name="arrow-left" size={22} color={tokens.colors.text} />
          <Text style={styles.fallbackBackLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.fallbackText}>Order not found</Text>
      </SafeAreaView>
    );
  }

  const addr = order.shippingAddress ?? {};

  return (
    <SafeAreaView style={styles.root}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
        onRightPress={() => console.log('share order', order.id)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.pageTitle}>Order #{order.id}</Text>
        <Text style={styles.placedAt}>Placed {formatDate(order.placedAt)}</Text>

        <StatusTimeline status={order.status} />

        {/* Items */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {(order.items ?? []).map((item, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              <ItemRow item={item} />
            </View>
          ))}
        </Card>

        {/* Shipping details */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Shipping details</Text>
          <Text style={styles.addrLine}>{addr.name}</Text>
          <Text style={styles.addrLine}>
            {[addr.line1, addr.city && `${addr.city}, ${addr.state} ${addr.zip}`, addr.country]
              .filter(Boolean)
              .join('\n')}
          </Text>
          {order.trackingNumber ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.trackingLabel}>Tracking number</Text>
              <View style={styles.trackingRow}>
                <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
                <Pressable onPress={() => console.log('track package', order.trackingNumber)}>
                  <Text style={styles.trackLink}>Track package</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </Card>

        {/* Payment */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <SummaryRow
            label="Subtotal"
            value={`$${(order.subtotal ?? 0).toFixed(2)}`}
          />
          <SummaryRow
            label="Shipping"
            value={`$${(order.shipping ?? 0).toFixed(2)}`}
          />
          <SummaryRow
            label="Tax"
            value={`$${(order.tax ?? 0).toFixed(2)}`}
          />
          <View style={styles.divider} />
          <SummaryRow
            label="Total"
            value={`$${(order.total ?? 0).toFixed(2)}`}
            bold
          />
        </Card>

        <Pressable
          style={styles.helpBtn}
          onPress={() => console.log('help with order', order.id)}
        >
          <Text style={styles.helpText}>Need help with this order?</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const NODE_SIZE = 32;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },

  // fallback
  fallbackBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  fallbackBackLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  fallbackText: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.xxxl,
  },

  // wordmark
  wordmark: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },

  // scroll
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },

  // header
  pageTitle: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    marginTop: tokens.spacing.md,
  },
  placedAt: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
  },

  // timeline
  timeline: {
    marginTop: tokens.spacing.xl,
  },
  timelineInner: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: NODE_SIZE / 2,
    left: NODE_SIZE / 2,
    right: NODE_SIZE / 2,
    height: 1.5,
    backgroundColor: tokens.colors.border,
    zIndex: 0,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.bg,
    borderWidth: 2,
    borderColor: tokens.colors.border,
  },
  nodeCompleted: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  nodeCurrent: {
    backgroundColor: tokens.colors.bg,
    borderColor: tokens.colors.primary,
    borderWidth: 2,
  },
  nodeUpcoming: {
    backgroundColor: tokens.colors.bg,
    borderColor: tokens.colors.border,
  },
  nodeLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.xs,
  },

  // cards
  card: {
    marginTop: tokens.spacing.lg,
  },
  cardTitle: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginVertical: tokens.spacing.md,
  },

  // items
  itemRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  itemThumbWrap: {
    width: 72,
    height: 72,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface,
    overflow: 'hidden',
  },
  itemThumb: {
    width: 72,
    height: 72,
  },
  itemThumbPlaceholder: {
    backgroundColor: tokens.colors.surface,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: tokens.spacing.xs,
  },
  itemTitle: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.35,
  },
  itemSupplier: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  itemPrice: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },

  // shipping
  addrLine: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.6,
  },
  trackingLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackingNumber: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
    flex: 1,
    marginRight: tokens.spacing.sm,
  },
  trackLink: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },

  // payment
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  summaryLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  summaryLabelBold: {
    fontFamily: tokens.fonts.sansBold,
  },
  summaryValue: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  summaryValueBold: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
  },

  // help
  helpBtn: {
    alignItems: 'center',
    marginVertical: tokens.spacing.xl,
  },
  helpText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.primary,
  },
});
