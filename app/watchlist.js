import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import FitmentBadge from '../src/components/FitmentBadge';
import EmptyState from '../src/components/EmptyState';
import useWatchlistStore from '../src/stores/watchlistStore';
import useProductsStore from '../src/stores/productsStore';
import useSubscriptionStore from '../src/stores/subscriptionStore';
import useUpgradeModalStore from '../src/stores/upgradeModalStore';

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function ListHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Price Watch</Text>
      <Text style={styles.headerSub}>We'll alert you when prices drop.</Text>
    </View>
  );
}

function WatchlistCard({ item }) {
  const removeFromWatchlist = useWatchlistStore((s) => s.removeFromWatchlist);
  const productsCache = useWatchlistStore((s) => s.productsCache);
  const byId = useProductsStore((s) => s.byId);

  const product = productsCache[item.productId] ?? byId(item.productId);
  const { productId, targetPriceCents, currentPriceCents } = item;
  const priceMet = currentPriceCents <= targetPriceCents;
  const deltaCents = Math.abs(currentPriceCents - targetPriceCents);

  const confirmRemove = () => {
    Alert.alert('Remove from watchlist?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFromWatchlist(productId),
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image
          source={{ uri: product?.imageUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product?.title ?? 'Part details unavailable'}
          </Text>
          <Text style={styles.supplier}>{product?.supplier ?? '—'}</Text>
          {product?.fitmentLabel ? (
            <FitmentBadge status={product.fitmentLabel} />
          ) : null}
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>Current</Text>
            <Text style={styles.priceAmount}>{formatCents(currentPriceCents)}</Text>
          </View>

          <View style={styles.deltaCol}>
            <Text style={[styles.deltaText, priceMet && styles.deltaTextMet]}>
              {priceMet ? 'Below target' : `${formatCents(deltaCents)} away`}
            </Text>
          </View>

          <View style={[styles.priceCol, styles.priceColRight]}>
            <Text style={styles.priceLabel}>Your target</Text>
            {priceMet ? (
              <>
                <View style={styles.targetMetRow}>
                  <Feather name="arrow-down" size={12} color={tokens.colors.primary} />
                  <Text style={[styles.priceAmount, styles.priceAmountMet]}>
                    {formatCents(targetPriceCents)}
                  </Text>
                </View>
                <Text style={styles.priceMetLabel}>Price met!</Text>
              </>
            ) : (
              <Text style={styles.priceAmount}>{formatCents(targetPriceCents)}</Text>
            )}
          </View>
        </View>
      </View>

      {/* TODO: add swipe-to-delete using react-native-gesture-handler Swipeable */}
      <Pressable style={styles.removeRow} onPress={confirmRemove}>
        <Text style={styles.removeText}>Remove</Text>
      </Pressable>
    </View>
  );
}

export default function WatchlistScreen() {
  const router = useRouter();
  const watchedItems = useWatchlistStore((s) => s.watchedItems);
  const status = useWatchlistStore((s) => s.status);
  const fetchWatchlist = useWatchlistStore((s) => s.fetchWatchlist);
  const { tier } = useSubscriptionStore();
  const showUpgrade = useUpgradeModalStore((s) => s.show);

  useEffect(() => {
    // TODO: tier gating should be handled more gracefully with store middleware or a withTier HOC
    if (tier === 'free') {
      showUpgrade('watchlist_locked');
      return;
    }
    fetchWatchlist();
  }, []);

  const topBar = (
    <TopBar
      leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
      titleNode={<Text style={styles.barTitle}>Watchlist</Text>}
      onLeftPress={() => router.back()}
    />
  );

  if (tier === 'free') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        {topBar}
        <EmptyState
          icon="bell"
          title="No watched parts"
          subtitle="Upgrade to track prices and get notified when they drop."
          primaryLabel="Browse parts"
          onPrimaryPress={() => router.push('/search')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {topBar}

      {status === 'loading' ? (
        <View style={styles.loader}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : watchedItems.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No watched parts"
          subtitle="Tap 'Watch price' on any product to track it here."
          primaryLabel="Browse parts"
          onPrimaryPress={() => router.push('/search')}
        />
      ) : (
        <FlatList
          data={watchedItems}
          keyExtractor={(item) => item.productId}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={<ListHeader />}
          renderItem={({ item }) => <WatchlistCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginTop: tokens.spacing.lg,
  },
  listContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  separator: {
    height: tokens.spacing.md,
  },
  header: {
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  headerTitle: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
  },
  headerSub: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    backgroundColor: tokens.colors.white,
  },
  cardTop: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.sm,
  },
  cardInfo: {
    flex: 1,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  productTitle: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.4,
  },
  supplier: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  priceSection: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceCol: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  priceColRight: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
  },
  priceAmount: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  priceAmountMet: {
    color: tokens.colors.primary,
  },
  targetMetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  priceMetLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.primary,
  },
  deltaCol: {
    paddingHorizontal: tokens.spacing.sm,
    alignSelf: 'center',
    alignItems: 'center',
  },
  deltaText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textAlign: 'center',
  },
  deltaTextMet: {
    color: tokens.colors.primary,
  },
  removeRow: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    padding: tokens.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
  },
});
