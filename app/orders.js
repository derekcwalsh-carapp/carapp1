import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import { labelSans } from '../src/theme/typography';
import TopBar from '../src/components/TopBar';
import useOrdersStore from '../src/stores/ordersStore';

const FILTERS = ['All', 'In Progress', 'Delivered'];

function formatDate(isoString) {
  const d = new Date(isoString);
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month} ${day} · ${year}`;
}

function StatusPill({ status }) {
  const config = {
    placed: { label: 'Processing', bg: tokens.colors.surface, color: tokens.colors.textMuted },
    paid: { label: 'Processing', bg: tokens.colors.surface, color: tokens.colors.textMuted },
    shipped: { label: 'Shipped', bg: tokens.colors.primary, color: tokens.colors.white },
    delivered: { label: 'Delivered', bg: tokens.colors.surface, color: tokens.colors.primary },
    processing: { label: 'Processing', bg: tokens.colors.surface, color: tokens.colors.textMuted },
  };
  const { label, bg, color } = config[status] ?? config.placed;
  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

function OrderCard({ order, onPress }) {
  const visibleThumbs = order.items.slice(0, 3);
  const overflow = order.items.length > 3 ? order.items.length - 3 : 0;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.dateText}>{formatDate(order.placedAt)}</Text>

      <View style={styles.thumbRow}>
        {visibleThumbs.map((item, idx) => (
          <Image
            key={idx}
            source={{ uri: item.thumbnailUri }}
            style={styles.thumb}
          />
        ))}
        {overflow > 0 && (
          <View style={styles.overflow}>
            <Text style={styles.overflowText}>+{overflow}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>
          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
        </Text>
        <StatusPill status={order.status} />
        <View style={styles.footerRight}>
          <Text style={styles.total}>${order.total.toFixed(2)}</Text>
          <Feather name="chevron-right" size={16} color={tokens.colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, status, fetchOrders } = useOrdersStore();
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const apiStatus =
      activeFilter === 'In Progress'
        ? 'in_progress'
        : activeFilter === 'Delivered'
          ? 'delivered'
          : undefined;
    fetchOrders(apiStatus);
  }, [activeFilter, fetchOrders]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={
          <Text style={styles.wordmark}>CarLens</Text>
        }
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
      />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.screenTitle}>Orders</Text>
            <View style={styles.segmentWrapper}>
              {FILTERS.map((f) => (
                <Pressable
                  key={f}
                  style={[styles.segment, activeFilter === f && styles.segmentActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      activeFilter === f && styles.segmentTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/order/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          status === 'loading' ? (
            <ActivityIndicator
              style={styles.loader}
              color={tokens.colors.primary}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No orders found.</Text>
            </View>
          )
        }
      />
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
  listContent: {
    paddingBottom: tokens.spacing.xxxl,
  },
  screenTitle: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
  },
  segmentWrapper: {
    flexDirection: 'row',
    marginHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: tokens.colors.primary,
  },
  segmentText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  segmentTextActive: {
    color: tokens.colors.white,
  },
  card: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  dateText: {
    ...labelSans,
    letterSpacing: 2,
    marginBottom: tokens.spacing.sm,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface,
  },
  overflow: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  itemCount: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 3,
    borderRadius: tokens.radius.pill,
  },
  statusText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
  },
  footerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacing.xs,
  },
  total: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  loader: {
    marginTop: tokens.spacing.xxxl,
  },
  empty: {
    alignItems: 'center',
    marginTop: tokens.spacing.xxxl,
  },
  emptyText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
  },
});
