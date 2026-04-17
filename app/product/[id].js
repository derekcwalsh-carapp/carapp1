import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState, useRef, useCallback } from 'react';

import tokens from '../../src/theme/tokens';
import FitmentBadge from '../../src/components/FitmentBadge';
import PrimaryButton from '../../src/components/PrimaryButton';
import useProductsStore from '../../src/stores/productsStore';
import useGarageStore from '../../src/stores/garageStore';
import useCartStore from '../../src/stores/cartStore';
import useSavedStore from '../../src/stores/savedStore';

const { width: SCREEN_W } = Dimensions.get('window');

const SECTIONS = [
  {
    key: 'description',
    title: 'Description',
    body: (p) =>
      p.description ||
      'A quality replacement part built to original specifications with premium materials for lasting performance.',
  },
  {
    key: 'fitment',
    title: 'Fitment details',
    body: (p) =>
      p.fitmentDetails ||
      'Compatible with vehicles as specified. Always verify your year, make, model, and engine before ordering.',
  },
  {
    key: 'returns',
    title: 'Returns & warranty',
    body: () =>
      '30-day returns accepted on most items. Original manufacturer warranty included where applicable. See seller policy for complete details.',
  },
];

function Snackbar({ opacity, message }) {
  return (
    <Animated.View style={[styles.snackbar, { opacity }]} pointerEvents="none">
      <Text style={styles.snackbarText}>{message}</Text>
    </Animated.View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const product = useProductsStore((s) => s.byId(id));
  const { vehicles, activeVehicleId } = useGarageStore();
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const { addItem } = useCartStore();
  const { toggleSave, isSaved } = useSavedStore();

  const saved = isSaved(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [openSections, setOpenSections] = useState({});
  const chevronAnims = useRef(SECTIONS.map(() => new Animated.Value(0))).current;
  const snackbarOpacity = useRef(new Animated.Value(0)).current;
  const [snackbarMsg, setSnackbarMsg] = useState('Added to cart');

  const showSnackbar = useCallback((msg) => {
    setSnackbarMsg(msg);
    snackbarOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(2000),
      Animated.timing(snackbarOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [snackbarOpacity]);

  const handleToggleSection = (index) => {
    const isOpen = !!openSections[index];
    setOpenSections((prev) => ({ ...prev, [index]: !isOpen }));
    Animated.timing(chevronAnims[index], {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleAddToCart = () => {
    if (product.fitmentLabel === 'requires_mod') {
      Alert.alert(
        'Modification Required',
        'This part requires modification for your vehicle. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add anyway',
            onPress: () => { addItem(product); showSnackbar('Added to cart'); },
          },
        ]
      );
    } else {
      // Preference: stay on screen with snackbar feedback.
      // To navigate to cart instead: router.push('/cart')
      addItem(product);
      showSnackbar('Added to cart');
    }
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.notFound}>
        <TouchableOpacity onPress={() => router.back()} style={styles.notFoundBack}>
          <Feather name="arrow-left" size={22} color={tokens.colors.text} />
          <Text style={styles.notFoundBackLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.notFoundText}>Product not found</Text>
      </SafeAreaView>
    );
  }

  const images = product.images?.length ? product.images : [product.imageUri].filter(Boolean);
  const filledStars = Math.round(product.rating || 0);
  const engineLabel = activeVehicle?.trim?.split('·')[0]?.trim() ?? activeVehicle?.model;
  const fitmentLabel = activeVehicle
    ? `Confirmed Fit · ${activeVehicle.year} ${activeVehicle.model}${engineLabel ? ' ' + engineLabel : ''}`
    : undefined;

  return (
    <SafeAreaView style={styles.root}>
      {/* Top bar — custom to fit two right-side icons */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarSide} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={tokens.colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarFlex} />
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => toggleSave(product, activeVehicleId)}>
            {saved ? (
              <Ionicons name="heart" size={22} color={tokens.colors.primary} />
            ) : (
              <Ionicons name="heart-outline" size={22} color={tokens.colors.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="share-2" size={22} color={tokens.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero image carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={images.length > 1}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {images.map((item, i) => (
            <View key={i} style={styles.heroImageContainer}>
              <Image
                source={typeof item === 'string' ? { uri: item } : item}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        )}
        {images.length <= 1 && <View style={styles.dotsPlaceholder} />}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.supplier}>{(product.supplier || '').toUpperCase()}</Text>

          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>

          {activeVehicle && (
            <View style={styles.badgeRow}>
              <FitmentBadge
                status={product.fitmentLabel || 'confirmed'}
                label={fitmentLabel}
              />
            </View>
          )}

          <Text style={styles.price}>
            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
          </Text>
          <Text style={styles.shipping}>
            {product.shippingEstimate || 'Free shipping · arrives in 2 days'}
          </Text>

          <View style={styles.starsRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <Feather
                key={i}
                name="star"
                size={14}
                color={i < filledStars ? tokens.colors.gold : tokens.colors.border}
                style={i < 4 && styles.starGap}
              />
            ))}
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviewCount ?? '1,247'} reviews)
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Accordion */}
          {SECTIONS.map(({ key, title, body }, index) => {
            const isOpen = !!openSections[index];
            const rotate = chevronAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '180deg'],
            });
            return (
              <View key={key}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => handleToggleSection(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.accordionTitle}>{title}</Text>
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <Feather name="chevron-down" size={18} color={tokens.colors.textMuted} />
                  </Animated.View>
                </TouchableOpacity>
                {isOpen && <Text style={styles.accordionBody}>{body(product)}</Text>}
                <View style={styles.divider} />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <PrimaryButton
          label="Add to cart"
          onPress={handleAddToCart}
          fullWidth
          labelStyle={styles.btnLabel}
        />
      </View>

      <Snackbar opacity={snackbarOpacity} message={snackbarMsg} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },

  // Not found
  notFound: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    paddingHorizontal: tokens.spacing.xl,
  },
  notFoundBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  notFoundBackLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  notFoundText: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xxxl,
    textAlign: 'center',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.colors.bg,
  },
  topBarSide: {
    width: 40,
    alignItems: 'center',
  },
  topBarFlex: {
    flex: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: tokens.spacing.sm,
  },

  // Hero
  heroImageContainer: {
    width: SCREEN_W,
    aspectRatio: 1,
    backgroundColor: tokens.colors.white,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  dotsPlaceholder: {
    height: tokens.spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.surface,
  },
  dotActive: {
    backgroundColor: tokens.colors.primary,
  },

  // Content
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  supplier: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: tokens.spacing.lg,
  },
  title: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.xxl * 1.25,
    marginTop: tokens.spacing.sm,
  },
  badgeRow: {
    marginTop: tokens.spacing.md,
  },
  price: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.display * 1.15,
    marginTop: tokens.spacing.md,
  },
  shipping: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.md,
  },
  starGap: {
    marginRight: 2,
  },
  ratingText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginLeft: tokens.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginTop: tokens.spacing.lg,
  },

  // Accordion
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.lg,
  },
  accordionTitle: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  accordionBody: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.6,
    paddingBottom: tokens.spacing.md,
  },

  // Footer
  footer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    backgroundColor: tokens.colors.bg,
  },
  btnLabel: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.md,
  },

  // Snackbar
  snackbar: {
    position: 'absolute',
    bottom: 90,
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
    backgroundColor: tokens.colors.text,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    alignItems: 'center',
  },
  snackbarText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.white,
  },
});
