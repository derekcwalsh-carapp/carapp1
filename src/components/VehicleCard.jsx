import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import tokens from '../theme/tokens';

export default function VehicleCard({ vehicle, isActive, onPress, onLongPress, variant = 'list' }) {
  const imgSource = vehicle.imageSource ?? (vehicle.imageUri ? { uri: vehicle.imageUri } : null);

  if (variant === 'garage') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.9}
        style={styles.garageCard}
        delayLongPress={400}
      >
        {imgSource ? (
          <Image source={imgSource} style={styles.garageImage} resizeMode="cover" />
        ) : (
          <View style={styles.garagePlaceholder} />
        )}
        <View style={styles.garageContent}>
          <Text style={styles.garageName}>
            {vehicle.year} {vehicle.model}
          </Text>
          {vehicle.trim ? (
            <Text style={styles.garageTrim}>{vehicle.trim}</Text>
          ) : null}
          {isActive ? (
            <View style={styles.activeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeLabel}>Active</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'hero') {
    return (
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.9} style={styles.heroCard}>
        <Image
          source={imgSource}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroName}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
          {vehicle.trim ? (
            <Text style={styles.heroTrim}>{vehicle.trim}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, isActive && styles.cardActive]}
    >
      <View style={styles.content}>
        <Text style={styles.year}>{vehicle.year}</Text>
        <Text style={styles.name}>
          {vehicle.make} {vehicle.model}
        </Text>
        {vehicle.trim ? <Text style={styles.trim}>{vehicle.trim}</Text> : null}
      </View>
      {isActive ? (
        <Feather name="check-circle" size={18} color={tokens.colors.primary} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  garageCard: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    overflow: 'hidden',
  },
  garageImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  garagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: tokens.colors.surface,
  },
  garageContent: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  garageName: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
  garageTrim: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.primary,
  },
  activeLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },
  heroCard: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  heroContent: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  heroName: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
  heroTrim: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  cardActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: '#F0F7F4',
  },
  content: { flex: 1 },
  year: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  trim: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: 2,
  },
});
