import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import tokens from '../theme/tokens';

export default function VehicleCard({ vehicle, isActive, onPress }) {
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
