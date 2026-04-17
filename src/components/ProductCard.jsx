import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../theme/tokens';
import FitmentBadge from './FitmentBadge';

export default function ProductCard({
  product,
  layout = 'row',
  onPress,
  onToggleSave,
  isSaved = false,
}) {
  const isGrid = layout === 'grid';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, isGrid ? styles.gridCard : styles.rowCard]}
      onPress={onPress}
    >
      {isGrid ? (
        <View style={styles.gridImageWrap}>
          <Image
            source={{ uri: product.imageUri }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          {onToggleSave && (
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => onToggleSave(product.id)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={18}
                color={isSaved ? tokens.colors.primary : tokens.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Image
          source={{ uri: product.imageUri }}
          style={styles.rowImage}
          resizeMode="cover"
        />
      )}

      <View style={[styles.info, isGrid && styles.infoGrid]}>
        {!isGrid && (
          <Text style={styles.supplier}>{product.supplier}</Text>
        )}
        <Text style={[styles.title, isGrid && styles.titleGrid]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={[styles.price, isGrid && styles.priceGrid]}>
          ${product.price?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </Text>
        {product.fitmentLabel ? <FitmentBadge status={product.fitmentLabel} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    overflow: 'hidden',
  },
  rowCard: {
    flexDirection: 'row',
  },
  gridCard: {
    flexDirection: 'column',
    flex: 1,
  },
  rowImage: {
    width: 96,
    height: 96,
  },
  gridImageWrap: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.pill,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
    justifyContent: 'center',
  },
  infoGrid: {
    justifyContent: 'flex-start',
  },
  supplier: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.md * 1.4,
  },
  titleGrid: {
    fontSize: tokens.fontSize.sm,
    lineHeight: tokens.fontSize.sm * 1.4,
  },
  price: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
  priceGrid: {
    fontSize: tokens.fontSize.md,
  },
});
