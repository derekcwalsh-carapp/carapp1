import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';
import FitmentBadge from './FitmentBadge';

export default function ProductCard({ product, layout = 'row' }) {
  const isGrid = layout === 'grid';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, isGrid ? styles.gridCard : styles.rowCard]}
    >
      <Image
        source={{ uri: product.imageUrl }}
        style={isGrid ? styles.gridImage : styles.rowImage}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={isGrid ? 2 : 1}>
          {product.name}
        </Text>
        {product.fitment ? <FitmentBadge status={product.fitment} /> : null}
        <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
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
    width: 88,
    height: 88,
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  info: {
    flex: 1,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  brand: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  price: {
    fontFamily: tokens.fonts.sansBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
});
