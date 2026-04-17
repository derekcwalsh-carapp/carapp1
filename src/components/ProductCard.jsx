import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';
import FitmentBadge from './FitmentBadge';

export default function ProductCard({ product, layout = 'row', onPress }) {
  const isGrid = layout === 'grid';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, isGrid ? styles.gridCard : styles.rowCard]}
      onPress={onPress}
    >
      <Image
        source={{ uri: product.imageUri }}
        style={isGrid ? styles.gridImage : styles.rowImage}
        resizeMode="cover"
      />
      <View style={[styles.info, isGrid && styles.infoGrid]}>
        <Text style={styles.supplier}>{product.supplier}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>
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
  },
  rowImage: {
    width: 96,
    height: 96,
  },
  gridImage: {
    width: '100%',
    height: 140,
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
  price: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
});
