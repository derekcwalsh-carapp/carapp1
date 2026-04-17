import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import ProductCard from '../src/components/ProductCard';
import SectionHeader from '../src/components/SectionHeader';
import useProductsStore from '../src/stores/productsStore';
import useIdentifyStore from '../src/stores/identifyStore';
import useCaptureStore from '../src/stores/captureStore';
import useIntentStore from '../src/stores/intentStore';
import useGarageStore from '../src/stores/garageStore';
import useCartStore from '../src/stores/cartStore';
import PrimaryButton from '../src/components/PrimaryButton';

const GROUP_ORDER = [
  'exact_replacement',
  'performance_upgrade',
  'oem_style',
  'best_value',
  'similar',
];

const DEFAULT_VISIBLE = 3;

export default function ResultsScreen() {
  const router = useRouter();
  const { groups, status, fetchForSession } = useProductsStore();
  const result = useIdentifyStore((s) => s.result);
  const photoUri = useCaptureStore((s) => s.photoUri);
  const intent = useIntentStore();
  const { vehicles, activeVehicleId } = useGarageStore();
  const itemCount = useCartStore((s) => s.itemCount);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const vehicleLabel = activeVehicle ? activeVehicle.model : 'Your Vehicle';

  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchForSession(result?.sessionId, activeVehicleId, intent);
  }, []);

  const toggleGroup = (groupId) =>
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topBarTitle}>Parts for your {vehicleLabel}</Text>}
        rightIcon={<Feather name="sliders" size={22} color={tokens.colors.text} />}
        onRightPress={() => console.log('filter')}
      />

      {status === 'loading' ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contextStrip}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.thumbnail} resizeMode="cover" />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
            )}
            <Text style={styles.partName} numberOfLines={2}>
              {result?.partName ?? 'Identified Part'}
            </Text>
          </View>

          {GROUP_ORDER.map((groupId) => {
            const group = groups[groupId];
            if (!group?.products?.length) return null;

            const isExpanded = expanded[groupId];
            const visible = isExpanded
              ? group.products
              : group.products.slice(0, DEFAULT_VISIBLE);
            const hasMore = group.products.length > DEFAULT_VISIBLE;

            return (
              <View key={groupId} style={styles.groupSection}>
                <SectionHeader
                  title={group.label}
                  count={group.products.length}
                  variant="serif"
                />
                <Text style={styles.explainer}>{group.explainer}</Text>

                <View style={styles.productList}>
                  {visible.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      layout="row"
                      onPress={() => router.push(`/product/${product.id}`)}
                    />
                  ))}
                </View>

                {hasMore && (
                  <TouchableOpacity
                    onPress={() => toggleGroup(groupId)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.showAll}>
                      {isExpanded
                        ? 'Show less'
                        : `Show all ${group.products.length}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label={itemCount > 0 ? `Go to Cart (${itemCount})` : 'Go to Cart'}
          variant="filled"
          fullWidth
          iconLeft={<Feather name="shopping-cart" size={16} color={tokens.colors.white} />}
          onPress={() => router.push('/(tabs)/cart')}
        />
        <View style={styles.footerRow}>
          <PrimaryButton
            label="Retake"
            variant="outlined"
            iconLeft={<Feather name="camera" size={15} color={tokens.colors.primary} />}
            onPress={() => router.replace('/camera')}
            style={styles.halfBtn}
          />
          <PrimaryButton
            label="Home"
            variant="outlined"
            iconLeft={<Feather name="home" size={15} color={tokens.colors.primary} />}
            onPress={() => router.replace('/(tabs)')}
            style={styles.halfBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    marginTop: tokens.spacing.sm,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.sm,
  },
  thumbnailPlaceholder: {
    backgroundColor: tokens.colors.surface,
  },
  partName: {
    flex: 1,
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.5,
  },
  groupSection: {
    marginBottom: tokens.spacing.xxl,
  },
  explainer: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.md,
  },
  productList: {
    gap: tokens.spacing.sm,
  },
  showAll: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
    marginTop: tokens.spacing.md,
    alignSelf: 'flex-start',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    backgroundColor: tokens.colors.bg,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
});
